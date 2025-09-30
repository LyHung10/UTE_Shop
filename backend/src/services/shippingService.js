// services/shippingService.js
import axios from "axios";

const ORS_API = "https://api.openrouteservice.org/v2/directions/driving-car";
const ORS_KEY = process.env.ORS_API_KEY;

// Điểm gốc: HCMUTE
const SHOP_COORDS = [106.7714, 10.8506]; // [lon, lat]

function calcShippingFee(distanceMeters) {
    const distanceKm = distanceMeters / 1000;
    let fee = 10000; // 10k cho 3km đầu
    if (distanceKm > 10) {
        fee += Math.ceil(distanceKm - 10) * 1500; // +2k/km
    }
    return fee;
}

export async function calculateShipping(address) {
    if (!address || !address.lat || !address.lon) {
        throw new Error("Địa chỉ không hợp lệ, thiếu lat/lon");
    }

    const body = {
        coordinates: [SHOP_COORDS, [address.lon, address.lat]]
    };

    const response = await axios.post(ORS_API, body, {
        headers: {
            Authorization: ORS_KEY,
            "Content-Type": "application/json"
        }
    });

    const data = response.data;
    const distance = data.routes[0].summary.distance; // mét
    const duration = data.routes[0].summary.duration; // giây
    const fee = calcShippingFee(distance);

    return { distance, duration, fee };
}
