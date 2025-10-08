// services/tokenService.js
import jwt from 'jsonwebtoken';
import dayjs from 'dayjs';
import db from '../models/index.js';

const { RefreshToken, User } = db;

export function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES,
  });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES,
  });
}

export async function persistRefreshToken(user_id, token, meta = {}) {
  const decoded = jwt.decode(token);
  const expiresAt = dayjs.unix(decoded.exp).toDate();

  // Kiểm tra xem user này đã có refresh token chưa
  const existing = await RefreshToken.findOne({ where: { user_id } });

  if (existing) {
    // Nếu có rồi → cập nhật lại token và ngày hết hạn
    return await existing.update({
      token,
      expired_at: expiresAt,
      user_agent: meta.userAgent || existing.user_agent,
      ip_address: meta.ip || existing.ip_address,
    });
  } else {
    // Nếu chưa có → tạo mới
    return await RefreshToken.create({
      user_id,
      token,
      expired_at: expiresAt,
      user_agent: meta.userAgent || null,
      ip_address: meta.ip || null,
    });
  }
}

export async function handleRefreshToken(refreshToken) {
  if (!refreshToken) return {
    success: false,
    message: "Refresh token required"
  }
  const stored = await RefreshToken.findOne({ where: { token: refreshToken } });
  if (!stored) return {
    success: false,
    message: "Invalid refresh token"
  }

  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  console.log(payload);

  const user = await User.findByPk(payload.sub);
  if (!user) return {
    success: false,
    message: "User not found"
  }
  // Cấp lại access token mới
  const newAccessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role_id,
  });

  return {
    success: true,
    message: "Refresh success",
    accessToken: newAccessToken
  };
}
