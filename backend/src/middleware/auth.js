// middleware/auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function auth(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      if (required) return res.status(401).json({ message: 'Missing token' });
      else return next();
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = payload; // { sub: userId, email }
      next();
    } catch (e) {
      return res.status(401).json({ message: 'Invalid/expired token' });
    }
  };
}


export function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Access token required" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Authorization header format: Bearer <token>" });
    }

    const token = parts[1];

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        // Token expired, invalid hoặc bị sửa
        return res.status(401).json({ message: "Token is not valid" });
      }

      // Gán payload vào req.user để controller dùng
      req.user = payload;

      // Debug log (có thể comment khi production)
      console.log("Authenticated user:", req.user);

      next();
    });
  } catch (err) {
    console.error("Error in authenticateToken:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

