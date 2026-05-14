import express from 'express';
import { placeOrder } from '../controllers/orderController.js';

const router = express.Router();

// Support both endpoints for backward compatibility
router.post("/place-order", placeOrder);
router.post("/place", placeOrder);

export default router;