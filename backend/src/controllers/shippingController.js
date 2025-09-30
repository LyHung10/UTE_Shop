// controllers/shippingController.js
import db from "../models/index.js";
import { calculateShipping } from "../services/shippingService.js";

export const getShippingFee = async (req, res) => {
  try {
    const userId = req.user.sub; // Lấy từ token thay vì params
    const { addressId } = req.params;

    console.log()
    const address = await db.Address.findOne({
      where: { id: addressId, user_id: userId }
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const result = await calculateShipping({
      lat: address.lat,
      lon: address.lon
    });

    return res.json({
      userId,
      addressId,
      distance_m: result.distance,
      duration_s: result.duration,
      shipping_fee: result.fee
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};