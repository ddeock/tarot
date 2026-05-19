const express = require('express');
const {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
} = require('../controllers/cartController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// 모든 장바구니 라우트는 로그인된 유저만 접근 가능
router.use(protect);

router.route('/')
    .get(getCart)
    .post(addToCart)
    .delete(clearCart);

router.route('/items/:productId')
    .put(updateCartItem)
    .delete(removeCartItem);

module.exports = router;
