import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'Product',
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
            },
        ],
        address: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            addressLine: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ['COD', 'ONLINE'],
            default: 'COD',
        },
        status: {
            type: String,
            enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Placed',
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('Order', OrderSchema)