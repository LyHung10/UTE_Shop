
import db from '../models/index.js';
import dayjs from 'dayjs';
import bcrypt from 'bcryptjs';
import OTP_TYPES from '../enums/otpType';

const { OtpCode } = db;

function generateOtp() {
  return (Math.floor(100000 + Math.random() * 900000)).toString();
}

export async function createOtp(userId, type = OTP_TYPES.REGISTER) {
  if (!Object.values(OTP_TYPES).includes(type)) {
    throw new Error(`Invalid OTP type: ${type}`);
  }

  const code = generateOtp(); 
  const code_hash = await bcrypt.hash(code, 10);
  const expired_at = dayjs().add(+process.env.OTP_EXPIRES_MIN, 'minute').toDate();

  await OtpCode.create({ user_id: userId, code_hash, expired_at, type });

  return code; // Trả về code để gửi mail/sms cho user
}


export async function verifyOtp(userId, code, type) {
  // validate type
  if (!Object.values(OTP_TYPES).includes(type)) {
    throw new Error(`Invalid OTP type: ${type}`);
  }

  const record = await OtpCode.findOne({
    where: { user_id: userId, type },
    order: [['created_at', 'DESC']],
  });

  if (!record) return false;
  if (record.consumed_at) return false; // đã dùng
  if (dayjs(record.expired_at).isBefore(dayjs())) return false;

  const ok = await bcrypt.compare(code, record.code_hash);
  if (!ok) return false;

  record.consumed_at = new Date();
  await record.save();

  return true;
}

