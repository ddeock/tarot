const express = require('express');
const { 
    getProducts, 
    createProduct, 
    getProduct, 
    updateProduct, 
    deleteProduct 
} = require('../controllers/productController');

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(createProduct);

router.route('/:id')
    .get(getProduct)
    .put(updateProduct)
    .delete(deleteProduct);

module.exports = router;
