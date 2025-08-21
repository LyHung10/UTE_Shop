const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const { sequelize } = require("./config/configdb");
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

const { errorHandler } = require("./middleware/errorHandler");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Rate limit
const otpLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use("/api/auth/register", otpLimiter);
app.use("/api/auth/forgot", otpLimiter);
app.use("/api/auth/login", loginLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Error handler
app.use(errorHandler);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected!");
    await sequelize.sync();
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running at http://localhost:${process.env.PORT || 5000}`)
    );
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
})();

module.exports = app;
