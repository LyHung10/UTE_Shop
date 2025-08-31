import axios from "../utils/axiosCustomize.jsx"

export async function getTopDiscount(limit = 4) {
    const res = await axios.get(`api/products/top-discount?limit=${limit}`);
    return res;
}
