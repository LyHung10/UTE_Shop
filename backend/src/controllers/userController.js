import {updateAvatar, updateProfileService} from "../services/user.service";
import db from "../models";

export async function getProfile(req, res) {
  try {
    const userId = req.user.sub; // lấy ID từ accessToken

    const user = await db.User.findByPk(userId, {
      attributes: ["id", "first_name", "last_name", "email", "phone_number", "gender", "image","loyalty_points"] // chỉ trả những field cần thiết
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("GetProfile error:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function updateProfileController(req, res) {
  try {
    const userId = req.user?.sub;
    const { first_name, last_name, phone_number } = req.body;

    const result = await updateProfileService(userId, {
      first_name,
      last_name,
      phone_number,
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 400).json({
      success: false,
      error: err.message,
    });
  }
}

export async function uploadUserAvatar(req, res) {
  try {
    const userId = req.user?.sub;
    const updated = await updateAvatar(userId, req.file);
    return res.json(updated);
  } catch (err) {
    console.error("uploadUserAvatar error:", err);
    return res.status(err.status || 500).json({ message: err.message || "Upload error" });
  }
}

