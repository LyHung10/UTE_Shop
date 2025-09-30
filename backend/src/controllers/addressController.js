// controllers/addressController.js
import db from "../models/index.js";
import { geocodeAddress } from "../services/geocodingService.js";

export const createAddress = async (req, res) => {
    try {
        const userId = req.user.sub; 
        const {
            address_line,
            city,
            district,
            ward,
            postal_code,
            is_default
        } = req.body;

        const fullAddress = `${address_line}, ${ward || ""}, ${district || ""}, ${city || ""}`;
        const { lat, lon } = await geocodeAddress(fullAddress);

        // Nếu có default mới thì bỏ default cũ
        if (is_default) {
            await db.Address.update(
                { is_default: false },
                { where: { user_id: userId } }
            );
        }

        const address = await db.Address.create({
            user_id: userId,
            address_line,
            city,
            district,
            ward,
            postal_code,
            is_default: is_default || false,
            lat,
            lon
        });

        return res.status(201).json(address);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const getUserAddresses = async (req, res) => {
    try {
        const userId = req.user.sub; // Lấy từ token thay vì params
        const addresses = await db.Address.findAll({ where: { user_id: userId } });
        return res.json(addresses);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};