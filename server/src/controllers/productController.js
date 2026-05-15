const Product = require('../models/Product');

// @설명    모든 상품 조회
// @경로    GET /api/products
// @권한    공개(Public)
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @설명    새로운 상품 생성
// @경로    POST /api/products
// @권한    비공개(Private)
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @설명    단일 상품 조회
// @경로    GET /api/products/:id
// @권한    공개(Public)
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: '상품을 찾을 수 없습니다' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @설명    상품 수정
// @경로    PUT /api/products/:id
// @권한    비공개(Private)
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!product) {
            return res.status(404).json({ success: false, error: '상품을 찾을 수 없습니다' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @설명    상품 삭제
// @경로    DELETE /api/products/:id
// @권한    비공개(Private)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: '상품을 찾을 수 없습니다' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
