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

// Allow only trusted frontend origins. You can set `FRONTEND_URL` in Vercel
// to your deployed frontend (e.g. https://ecomerce-mern-tawny.vercel.app).
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://ecomerce-mern-tawny.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (like curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('CORS policy: Origin not allowed'));
    },
    credentials: true,
}));
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