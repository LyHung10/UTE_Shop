import { updateUserService } from "../services/user.service";

// export async function updateUser(req, res) {
//   try {
//     // Tạm thời hardcode userId để test
//     const userId = req.body.userId; // client gửi userId trong body
//     const updatedUser = await updateUserService(userId, req.body);

//     res.json({
//       message: "User updated successfully",
//       user: updatedUser
//     });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// }


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