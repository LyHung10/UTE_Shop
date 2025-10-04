// controllers/authController.js
import { validationResult } from 'express-validator';
import * as authService from '../services/authService.js';
import {handleRefreshToken} from "../services/tokenService";

export async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const result = await authService.registerUser(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const result = await authService.verifyUserOtp(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const result = await authService.loginUser(req.body, req);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const result = await authService.forgotPassword(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const result = await authService.resetPassword(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Gọi service xử lý logic
    const result = await handleRefreshToken(refreshToken);

    return res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken: result.accessToken,
    });
  } catch (error) {
    console.error("Refresh token controller error:", error);
    return res.status(403).json({
      message: error.message || "Invalid or expired refresh token",
    });
  }
}
