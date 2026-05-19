const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, '수량은 1개 이상이어야 합니다.'],
        default: 1
    }
});

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // 1명의 유저는 1개의 장바구니만 가짐
    },
    items: [CartItemSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', CartSchema);
