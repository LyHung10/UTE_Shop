import { updateUserService } from "../services/user.service";
import db from "../models";

export async function updateUser(req, res) {
  try {
    // Lấy userId trực tiếp từ payload token
    const userId = req.user.sub; // chú ý phải đúng key khi sign token

    // Gọi service để update
    const updatedUser = await updateUserService(userId, req.body);

    res.json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function getProfile(req, res) {
  try {
    const userId = req.user.sub; // lấy ID từ accessToken

    const user = await db.User.findByPk(userId, {
      attributes: ["id", "first_name", "last_name", "email", "phone_number", "gender", "image"] // chỉ trả những field cần thiết
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("GetProfile error:", err);
    res.status(500).json({ message: err.message });
  }
}