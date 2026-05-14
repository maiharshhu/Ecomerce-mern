import express from 'express';
import {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct
} from "../controllers/productController.js"


const router = express.Router();

// route to create a new product
router.post('/add', createProduct);

// router to get all products 
router.get('/', getProducts);

// route to update a product by id 
router.put('/update/:id', updateProduct);

// route to delete a product
router.delete('/delete/:id', deleteProduct);

export default router;