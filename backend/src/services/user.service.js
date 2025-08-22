import db from "../models/index.js";

export async function updateUserService(userId, updateData) {
  const user = await db.User.findByPk(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Chỉ cho update những field cho phép
  const { first_name, last_name, address } = updateData;
  user.first_name = first_name ?? user.first_name;
  user.last_name = last_name ?? user.last_name;
  user.address = address ?? user.address;

  await user.save();
  return user;
}