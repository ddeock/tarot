const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
    getMe
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// 1. 유저 전체 조회
router.get('/', getUsers);

// 2. 유저 생성 (회원가입)
router.post('/', createUser);

// 3. 유저 로그인
router.post('/login', loginUser);

// 4. 현재 로그인된 유저 정보 조회
router.get('/me', protect, getMe);

// 5. 유저 단일 조회
router.get('/:id', getUser);

// 4. 유저 정보 수정
router.put('/:id', updateUser);

// 5. 유저 삭제
router.delete('/:id', deleteUser);

module.exports = router;
