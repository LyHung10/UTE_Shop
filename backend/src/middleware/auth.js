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
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Access token required" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Authorization header format: Bearer <token>" });
  }

  const token = parts[1];

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, payload) => {
    if (err) {
      console.log("JWT verify error:", err);
      return res.status(401).json({ message: "Token is not valid" });
    }
  console.log("Token received:", token);

    req.user = payload; // payload token
    next();
  });
}