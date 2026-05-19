const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @설명    내 장바구니 조회
// @경로    GET /api/cart
// @권한    비공개 (로그인 필요)
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        
        if (!cart) {
            cart = await Cart.create({ user: req.user.id, items: [] });
        }
        
        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @설명    장바구니에 아이템 추가
// @경로    POST /api/cart
// @권한    비공개
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, error: '상품을 찾을 수 없습니다' });
        }

        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = await Cart.create({ user: req.user.id, items: [] });
        }

        // 이미 장바구니에 있는지 확인
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            // 있으면 수량 증가
            cart.items[itemIndex].quantity += (quantity || 1);
        } else {
            // 없으면 새로 추가
            cart.items.push({ product: productId, quantity: quantity || 1 });
        }

        await cart.save();
        await cart.populate('items.product');

        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @설명    장바구니 아이템 수량 변경
// @경로    PUT /api/cart/items/:productId
// @권한    비공개
exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { productId } = req.params;

        if (quantity < 1) {
            return res.status(400).json({ success: false, error: '수량은 1개 이상이어야 합니다' });
        }

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ success: false, error: '장바구니가 없습니다' });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            await cart.save();
            await cart.populate('items.product');
            res.status(200).json({ success: true, data: cart });
        } else {
            res.status(404).json({ success: false, error: '장바구니에 해당 상품이 없습니다' });
        }
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @설명    장바구니 아이템 삭제
// @경로    DELETE /api/cart/items/:productId
// @권한    비공개
exports.removeCartItem = async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ success: false, error: '장바구니가 없습니다' });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        
        await cart.save();
        await cart.populate('items.product');

        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @설명    장바구니 비우기
// @경로    DELETE /api/cart
// @권한    비공개
exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ success: false, error: '장바구니가 없습니다' });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
