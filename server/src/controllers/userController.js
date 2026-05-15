const User = require('../models/User');

// @설명    모든 유저 조회
// @경로    GET /api/users
// @권한    공개(Public)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @설명    특정 유저 조회
// @경로    GET /api/users/:id
// @권한    공개(Public)
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @설명    새로운 유저 생성 (회원가입)
// @경로    POST /api/users
// @권한    공개(Public)
exports.createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);

        // 토큰 생성
        const token = user.getSignedJwtToken();

        res.status(201).json({
            success: true,
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                user_type: user.user_type
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @설명    유저 로그인
// @경로    POST /api/users/login
// @권한    공개(Public)
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. 이메일 및 비밀번호 입력 확인
        if (!email || !password) {
            return res.status(400).json({ success: false, error: '이메일과 비밀번호를 입력해주세요.' });
        }

        // 2. 유저 존재 여부 확인 (비밀번호 필드 포함)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: '유효하지 않은 인증 정보입니다.' });
        }

        // 3. 비밀번호 일치 확인
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: '유효하지 않은 인증 정보입니다.' });
        }

        // 4. 토큰 생성
        const token = user.getSignedJwtToken();

        res.status(200).json({
            success: true,
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                user_type: user.user_type
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @설명    현재 로그인된 유저 정보 조회
// @경로    GET /api/users/me
// @권한    보호됨(Private)
exports.getMe = async (req, res) => {
    try {
        // protect 미들웨어에서 이미 req.user를 설정함
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @설명    유저 정보 수정
// @경로    PUT /api/users/:id
// @권한    공개(Public)
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @설명    유저 삭제
// @경로    DELETE /api/users/:id
// @권한    공개(Public)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
