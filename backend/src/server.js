// src/server.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { sequelize } from './config/configdb.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRouter.js';
import categoryRoutes from './routes/categoryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js'
import { errorHandler } from './middleware/errorHandler.js';
import reviewRoutes from './routes/reviewRoutes.js';
import voucherRoutes from "./routes/voucherRoutes";
import favoriteProductRoute from "./routes/favoriteProductRoute.js";
// import notificationRoutes from "./routes/notificationRoutes.js";
import chatRoutes from './routes/chatRoutes.js';
import SocketService from './services/socketService.js';
dotenv.config();

const app = express();
const server = createServer(app);
const io = SocketService.init(server);

//Middleware to attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware chung
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Rate limit
// const otpLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 });
// const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// Serve file tạm / output
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
// app.use('/api/auth/register', otpLimiter);
// app.use('/api/auth/forgot-password', otpLimiter);
// app.use('/api/auth/login', loginLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/favorites', favoriteProductRoute);
app.use('/api/chat', chatRoutes);
// Error handler
app.use(errorHandler);

// Start server
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected!');
    await sequelize.sync();
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
})();

export default app;
