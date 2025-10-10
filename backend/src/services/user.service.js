import db from "../models/index.js";
import bcrypt from "bcryptjs";

export async function updateProfileService(userId, updateData) {
  // Tìm user
  const user = await db.User.findByPk(userId);
  // Destructure các field cho phép chỉnh
  const { first_name, last_name, phone_number} = updateData;

  // Validate first_name
  if (first_name !== undefined) {
    if (typeof first_name !== "string" || first_name.trim() === "") {
      return {
        success: false,
        message: "First name không hợp lệ."
      }
    } else if (first_name.length > 50) {
      return {
        success: false,
        message: "First name không được vượt quá 50 ký tự."
      }
    }
  }

  // Validate last_name
  if (last_name !== undefined) {
    if (typeof last_name !== "string" || last_name.trim() === "") {
      return {
        success: false,
        message: "Last name không hợp lệ."
      }
    } else if (last_name.length > 50) {
      return {
        success: false,
        message: "Last name không được vượt quá 50 ký tự."
      }
    }
  }

  // Validate phone_number
  if (phone_number !== undefined) {
    const phoneRegex = /^[0-9]{9,15}$/; // chỉ cho phép số, dài 9–15 ký tự
    if (!phoneRegex.test(phone_number)) {
      return {
        success: false,
        message: "Số điện thoại không hợp lệ. Chỉ bao gồm số và dài 9–15 ký tự."
      }
    }
  }

  user.first_name = first_name ?? user.first_name;
  user.last_name = last_name ?? user.last_name;
  user.phone_number = phone_number ?? user.phone_number;
  await user.save();

  return {
    success: true,
    message: "Cập nhật thông tin thành công."
  }
}

export async function changePassword(userId, password, newPassword) {
  // Validate thô
  if (typeof password !== "string" || typeof newPassword !== "string") {
    return { success: false, message: "Dữ liệu không hợp lệ." };
  }
  const oldPwd = password.trim();
  const newPwd = newPassword.trim();

  if (!oldPwd || !newPwd) {
    return { success: false, message: "Vui lòng nhập đầy đủ mật khẩu." };
  }
  // Lấy user
  const user = await db.User.findByPk(userId);
  if (!user) {
    // Tránh lộ thông tin: delay nhẹ hoặc compare với hash giả tuỳ ý
    return { success: false, message: "Người dùng không tồn tại." };
  }

  // So sánh mật khẩu cũ
  const match = await bcrypt.compare(oldPwd, user.password);
  if (!match) {
    return { success: false, message: "Mật khẩu hiện tại không chính xác." };
  }

  // Cấm dùng lại mật khẩu cũ
  const isSameAsOld = await bcrypt.compare(newPwd, user.password);
  if (isSameAsOld) {
    return { success: false, message: "Mật khẩu mới không được trùng với mật khẩu hiện tại." };
  }

  // Hash và lưu
  const hashed = await bcrypt.hash(newPwd, 10);
  user.password = hashed;
  await user.save(); // nhớ await

  return { success: true, message: "Đổi mật khẩu thành công." };
}

export async function updateAvatar(userId, file) {
  if (!file) {
    const err = new Error("No file uploaded");
    err.status = 400;
    throw err;
  }

  // Validate nhẹ (nếu bạn dùng multer filter rồi thì có thể bỏ)
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
  if (file.mimetype && !allowed.includes(file.mimetype)) {
    return {
      success: false,
      message: "Ảnh không đúng định dạng"
    }
  }
  // ví dụ giới hạn 5MB
  if (typeof file.size === "number" && file.size > 5 * 1024 * 1024) {
    return {
      success: false,
      message: "Ảnh vượt quá 5MB"
    }
  }

  // URL ảnh public do multer-cloudinary gán tại file.path
  const avatarUrl = file.path || file.location || null;
  if (!avatarUrl) {
    return {
      success: false,
      message: "Chưa có đường dâ ảnh"
    }
  }

  return await db.sequelize.transaction(async (t) => {
    const user = await db.User.findByPk(userId, { transaction: t });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    user.image = avatarUrl;
    await user.save({ transaction: t });

    return {
      success: true,
      message: "Upload ảnh thành công"
    }
  });
}