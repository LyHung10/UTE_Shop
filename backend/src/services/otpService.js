
import db from '../models/index.js';
import dayjs from 'dayjs';
import bcrypt from 'bcryptjs';

const { OtpCode } = db;

function generateOtp() {
  return (Math.floor(100000 + Math.random() * 900000)).toString();
}

export async function createOtp(userId) {
  const code = generateOtp();
  const code_hash = await bcrypt.hash(code, 10);
  const expired_at = dayjs().add(+process.env.OTP_EXPIRES_MIN, 'minute').toDate();

  // Tạo OTP record
  await OtpCode.create({ user_id: userId, code_hash, expired_at });
  return code;
}

export async function verifyOtp(userId, code) {
  const record = await OtpCode.findOne({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
  });
  if (!record) return false;
  if (dayjs(record.expired_at).isBefore(dayjs())) return false;

  const ok = await bcrypt.compare(code, record.code_hash);
  if (!ok) return false;

  record.consumed_at = new Date();
  await record.save();
  return true;
}
