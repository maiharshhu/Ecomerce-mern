import express from "express";
import {
    addToCart,
    removeItem,
    updateQuantity,
    getCart

} from '../controllers/cartController.js';

const router = express.Router();

// Add item to cart
router.post('/add', addToCart);

// Remove items from cart 
router.post('/remove', removeItem);

// update quantity in cart
router.post('/update', updateQuantity);

// get user's cart
router.get('/:userId', getCart);

export default router;

