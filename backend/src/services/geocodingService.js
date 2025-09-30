// services/geocodingService.js
import axios from "axios";

const ORS_GEOCODE_API = "https://api.openrouteservice.org/geocode/search";
const ORS_KEY = process.env.ORS_API_KEY;
export async function geocodeAddress(addressText) {
  const response = await axios.get(ORS_GEOCODE_API, {
    params: {
      api_key: ORS_KEY,
      text: addressText,
      boundary_country: "VN"
    }
  });

  if (!response.data.features || response.data.features.length === 0) {
    throw new Error("Không tìm thấy tọa độ cho địa chỉ");
  }

  const coords = response.data.features[0].geometry.coordinates; // [lon, lat]
  return { lon: coords[0], lat: coords[1] };
}
