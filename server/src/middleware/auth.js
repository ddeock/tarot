const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 보호된 라우트 접근을 위한 미들웨어
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // 헤더에서 토큰 추출
        token = req.headers.authorization.split(' ')[1];
    }

    // 토큰 존재 여부 확인
    if (!token) {
        return res.status(401).json({ success: false, error: '이 라우트에 접근하기 위한 권한이 없습니다.' });
    }

    try {
        // 토큰 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 현재 유저 정보 가져오기
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({ success: false, error: '해당 토큰에 해당하는 유저가 존재하지 않습니다.' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: '유효하지 않은 토큰입니다.' });
    }
};

// 관리자 권한 확인 미들웨어
exports.admin = (req, res, next) => {
    if (req.user && (req.user.user_type === '관리자' || req.user.user_type === 'admin' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ success: false, error: '관리자 권한이 필요합니다.' });
    }
};
