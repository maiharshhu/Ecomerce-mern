import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB, { getMongoUri } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productsRoutes.js';
import cartRoutes from './routes/cart.js';
import addressRoutes from './routes/address.js';
import orderRoute from './routes/order.js'

dotenv.config();

if (!getMongoUri()) {
    throw new Error("MONGO_URI or MONGODB_URI is required in backend/.env");
}

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required in backend/.env");
}

const app = express();

// Allow only trusted frontend origins. Configure both URLs for production and development.
const allowedOrigins = [
    process.env.FRONTEND_URL || 'https://ecomerce-mern-tawny.vercel.app',
    'https://ecomerce-mern-tawny.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (like curl, Postman, mobile apps)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        console.error(`CORS blocked origin: ${origin}`);
        return callback(new Error('CORS policy: Origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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



const port = process.env.PORT || 5001;

connectDB();

// Vercel provides the HTTP server; only listen locally.
if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`server is running on ${port} port`);
    });
}

export default app;