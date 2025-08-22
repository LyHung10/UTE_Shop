import { updateUserService } from "../services/user.service";

export async function updateUser(req, res) {
  try {
    // Tạm thời hardcode userId để test
    const userId = req.body.userId; // client gửi userId trong body
    const updatedUser = await updateUserService(userId, req.body);

    res.json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}