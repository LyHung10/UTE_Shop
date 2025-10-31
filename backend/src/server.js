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
import paymentRoutes from './routes/paymentRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import reviewRoutes from './routes/reviewRoutes.js';
import voucherRoutes from "./routes/voucherRoutes.js";
import favoriteProductRoute from "./routes/favoriteProductRoute.js";
import chatRoutes from './routes/chatRoutes.js';
import SocketService from './services/socketService.js';
import shippingRoutes from './routes/shippingRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import productSearchRoutes from './routes/productSearchRoutes.js';
import flashSaleRoutes from './routes/flashSaleRoutes.js';
import { initializeNotificationSocket } from './socket/notificationHandlers.js';

// ⬇️ Thêm 2 import này
import productSearchController from './controllers/productSearchController.js';
import elasticClient from './config/elasticsearch.js';

dotenv.config();

const app = express();
const server = createServer(app);

// CHỈ DÙNG 1 SocketService DUY NHẤT
const io = SocketService.init(server);

// KHỞI TẠO NOTIFICATION SOCKET TRÊN CÙNG IO INSTANCE
const notificationNamespace = initializeNotificationSocket(io);

// Middleware to attach io và notificationNamespace to req
app.use((req, res, next) => {
  req.io = io;
  req.notificationNamespace = notificationNamespace;
  next();
});

// Middleware chung
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
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
app.use('/api/shipping', shippingRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', productSearchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/flash-sales', flashSaleRoutes);

// Error handler
app.use(errorHandler);

// EXPORT CÁC BIẾN CẦN THIẾT
export { io, notificationNamespace };

// Start server
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected!');
    await sequelize.sync();

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

    // 🔍 Kiểm tra Elasticsearch song song (không chặn server)
    elasticClient.ping()
        .then(async () => {
          console.log('✅ Elasticsearch is up.');
          const ok = await productSearchController.initElasticsearch();
          if (ok) {
            console.log('🚀 Search index [products] ready (initialized + synced).');
          } else {
            console.warn('⚠️ Could not initialize Elasticsearch. Search will fallback to MySQL.');
          }
        })
        .catch(() => {
          console.warn('⚠️ Elasticsearch unreachable or not running. Using MySQL search fallback.');
        });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
})();

export default app;
