const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: [true, 'SKU를 입력해주세요'],
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, '상품명을 입력해주세요'],
        trim: true,
        maxlength: [50, '상품명은 50자를 초과할 수 없습니다']
    },
    description: {
        type: String,
        maxlength: [500, '상품 설명은 500자를 초과할 수 없습니다']
    },
    price: {
        type: Number,
        required: [true, '가격을 입력해주세요']
    },
    category: {
        type: String,
        required: [true, '카테고리를 입력해주세요'],
        enum: ['카드', '악세사리']
    },
    image: {
        type: String,
        required: [true, '상품 대표 이미지를 입력해주세요']
    },
    images: [String],
    originalPrice: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        required: [true, '재고 수량을 입력해주세요'],
        default: 0
    },
    minStockAlert: {
        type: Number,
        default: 10
    },
    onSale: {
        type: Boolean,
        default: false
    },
    tags: {
        type: String,
        trim: true
    },
    weight: {
        type: Number,
        default: 0
    },
    brand: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', ProductSchema);
