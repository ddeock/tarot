const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '상품명을 입력해주세요'],
        trim: true,
        maxlength: [50, '상품명은 50자를 초과할 수 없습니다']
    },
    description: {
        type: String,
        required: [true, '상품 설명을 입력해주세요'],
        maxlength: [500, '상품 설명은 500자를 초과할 수 없습니다']
    },
    price: {
        type: Number,
        required: [true, '가격을 입력해주세요']
    },
    category: {
        type: String,
        required: [true, '카테고리를 입력해주세요']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', ProductSchema);
