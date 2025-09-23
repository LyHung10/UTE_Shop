// src/server.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { sequelize } from './config/configdb.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRouter.js';
import categoryRoutes from './routes/categoryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js'
import { errorHandler } from './middleware/errorHandler.js';
import reviewRoutes from './routes/reviewRoutes.js';
dotenv.config();

const app = express();

// Middleware chung
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Rate limit
const otpLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// Serve file tạm / output
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth/register', otpLimiter);
app.use('/api/auth/forgot-password', otpLimiter);
app.use('/api/auth/login', loginLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use(errorHandler);

// Start server
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected!');
    await sequelize.sync();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
})();

export default app;
