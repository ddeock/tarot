const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    orderItems: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            }
        }
    ],
    shippingAddress: {
        recipientName: { type: String, required: true },
        recipientPhone: { type: String, required: true },
        postalCode: { type: String },
        address: { type: String, required: true },
        detailAddress: { type: String },
        deliveryRequest: { type: String }
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    paymentResult: {
        id: { type: String }, // imp_uid
        merchant_uid: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String }
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: {
        type: Date
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['결제대기', '결제완료', '상품준비중', '배송중', '배송완료', '주문취소'],
        default: '결제대기'
    },
    trackingNumber: {
        type: String
    },
    deliveredAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);
