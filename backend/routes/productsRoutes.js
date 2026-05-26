import express from 'express';
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from "../controllers/productController.js"
import { authenticate, requireAdmin } from "../middleware/firebaseAuth.js";


const router = express.Router();

// route to create a new product
router.post('/add', authenticate, requireAdmin, createProduct);

// router to get all products 
router.get('/', getProducts);

// route to update a product by id 
router.put('/update/:id', authenticate, requireAdmin, updateProduct);

// route to delete a product
router.delete('/delete/:id', authenticate, requireAdmin, deleteProduct);

// route to get a product by id
router.get('/:id', getProductById);

export default router;