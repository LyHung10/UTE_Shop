// services/tokenService.js
import jwt from 'jsonwebtoken';
import dayjs from 'dayjs';
import db from '../models/index.js';

const { RefreshToken } = db;

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

export async function persistRefreshToken(user_id, token) {
  const decoded = jwt.decode(token);
  const expiresAt = dayjs.unix(decoded.exp).toDate();

  return RefreshToken.create({
    user_id,
    token,
    expired_at: expiresAt,
  });
}

export async function rotateRefreshToken(oldToken) {
  // Optional: revoke old token, create new token
}
