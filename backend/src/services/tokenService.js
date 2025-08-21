const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
// const RefreshToken = require('../models/RefreshToken');
const db = require("../models");
const RefreshToken = db.RefreshToken;

require('dotenv').config();


function signAccessToken(payload) {
return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES });
}


function signRefreshToken(payload) {
return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES });
}


async function persistRefreshToken(user_id, token) {
  const decoded = jwt.decode(token);
  const expiresAt = dayjs.unix(decoded.exp).toDate();

  return RefreshToken.create({
    user_id,
    token,
    expired_at: expiresAt,
  });
}

async function rotateRefreshToken(oldToken) {
// Optional: revoke old, create new
}


module.exports = { signAccessToken, signRefreshToken, persistRefreshToken };