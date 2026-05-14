import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productsRoutes.js';
import cartRoutes from './routes/cart.js';
import addressRoutes from './routes/address.js';
import orderRoute from './routes/order.js'

dotenv.config();

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required in backend/.env");
}

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required in backend/.env");
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/order', orderRoute)
app.get('/', (req, res) => {
    res.send("Api is  running ..")
});



connectDB();

app.listen(process.env.PORT || 5001, () => {
    console.log("server is running on 5001 port")
});