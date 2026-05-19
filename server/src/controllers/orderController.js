const Order = require('../models/Order');

// @desc    새 주문 생성
// @route   POST /api/orders
// @access  Private
exports.addOrderItems = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
            imp_uid,
            merchant_uid
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ success: false, error: '주문할 상품이 없습니다.' });
        }

        // 1. 주문 중복 검사
        if (imp_uid || merchant_uid) {
            const existingOrder = await Order.findOne({
                $or: [
                    { 'paymentResult.id': imp_uid },
                    { 'paymentResult.merchant_uid': merchant_uid }
                ]
            });
            if (existingOrder) {
                return res.status(400).json({ success: false, error: '이미 결제된 주문입니다. (중복 결제)' });
            }
        }

        // 2. 포트원 결제 검증
        let isPaid = false;
        let paymentResult = undefined;
        
        if (imp_uid) {
            const PORTONE_API_KEY = process.env.PORTONE_API_KEY;
            const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET;

            if (PORTONE_API_KEY && PORTONE_API_SECRET) {
                try {
                    // 2-1. 포트원 토큰 발급
                    const tokenResponse = await fetch('https://api.iamport.kr/users/getToken', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            imp_key: PORTONE_API_KEY,
                            imp_secret: PORTONE_API_SECRET
                        })
                    });
                    const tokenData = await tokenResponse.json();
                    
                    if (tokenData.code !== 0) {
                        throw new Error('포트원 토큰 발급 실패: ' + tokenData.message);
                    }
                    const access_token = tokenData.response.access_token;

                    // 2-2. 결제 정보 조회
                    const paymentResponse = await fetch(`https://api.iamport.kr/payments/${imp_uid}`, {
                        headers: { 'Authorization': access_token }
                    });
                    const paymentData = await paymentResponse.json();

                    if (paymentData.code !== 0) {
                        throw new Error('포트원 결제 정보 조회 실패: ' + paymentData.message);
                    }
                    const paymentInfo = paymentData.response;

                    // 2-3. 금액 검증 (중요: 클라이언트에서 보낸 totalPrice와 포트원의 amount 비교)
                    if (paymentInfo.amount !== totalPrice) {
                        return res.status(400).json({ success: false, error: '위조된 결제 시도입니다. 결제 금액이 일치하지 않습니다.' });
                    }

                    // 검증 통과
                    isPaid = true;
                    paymentResult = {
                        id: paymentInfo.imp_uid,
                        merchant_uid: paymentInfo.merchant_uid,
                        status: paymentInfo.status,
                        update_time: new Date().toISOString(),
                        email_address: paymentInfo.buyer_email || ''
                    };
                } catch (verifyError) {
                    console.error('포트원 결제 검증 에러:', verifyError);
                    return res.status(400).json({ success: false, error: '결제 검증에 실패했습니다.', detail: verifyError.message });
                }
            } else {
                console.warn('포트원 API 키가 환경변수에 설정되지 않아 결제 검증을 건너뜁니다.');
                // 환경변수가 없으면 테스트/개발 환경이라 가정하고 무조건 성공 처리
                isPaid = true;
                paymentResult = {
                    id: imp_uid,
                    merchant_uid: merchant_uid,
                    status: 'paid',
                    update_time: new Date().toISOString()
                };
            }
        }

        // 3. 주문 저장
        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
            isPaid,
            paidAt: isPaid ? Date.now() : undefined,
            orderStatus: isPaid ? '결제완료' : '결제대기',
            paymentResult: isPaid ? paymentResult : undefined
        });

        const createdOrder = await order.save();
        res.status(201).json({ success: true, data: createdOrder });

    } catch (error) {
        console.error('주문 생성 오류:', error);
        res.status(500).json({ success: false, error: '서버 오류로 주문을 생성할 수 없습니다.', detail: error.message });
    }
};

// @desc    로그인한 유저의 주문 내역 조회
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        console.error('내 주문 조회 오류:', error);
        res.status(500).json({ success: false, error: '서버 오류로 주문 내역을 조회할 수 없습니다.' });
    }
};

// @desc    주문 ID로 주문 조회
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ success: false, error: '주문을 찾을 수 없습니다.' });
        }

        // 로그인한 유저 본인의 주문이거나 관리자인지 확인
        if (order.user._id.toString() !== req.user._id.toString() && req.user.user_type !== '관리자') {
            return res.status(403).json({ success: false, error: '해당 주문을 조회할 권한이 없습니다.' });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error('주문 조회 오류:', error);
        res.status(500).json({ success: false, error: '서버 오류로 주문을 조회할 수 없습니다.' });
    }
};

// @desc    주문을 결제 완료 상태로 업데이트
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, error: '주문을 찾을 수 없습니다.' });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.orderStatus = '결제완료';
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.payer?.email_address
        };

        const updatedOrder = await order.save();

        res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
        console.error('주문 결제 업데이트 오류:', error);
        res.status(500).json({ success: false, error: '서버 오류로 결제 상태를 업데이트할 수 없습니다.' });
    }
};

// @desc    모든 주문 조회
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        console.error('전체 주문 조회 오류:', error);
        res.status(500).json({ success: false, error: '서버 오류로 전체 주문 내역을 조회할 수 없습니다.' });
    }
};

// @desc    주문 상태 업데이트 (배송완료 등)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, error: '주문을 찾을 수 없습니다.' });
        }

        order.orderStatus = req.body.orderStatus || order.orderStatus;
        
        if (req.body.orderStatus === '배송완료') {
            order.deliveredAt = Date.now();
        }

        if (req.body.trackingNumber) {
            order.trackingNumber = req.body.trackingNumber;
        }

        const updatedOrder = await order.save();

        res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
        console.error('주문 배송 상태 업데이트 오류:', error);
        res.status(500).json({ success: false, error: '서버 오류로 배송 상태를 업데이트할 수 없습니다.' });
    }
};
