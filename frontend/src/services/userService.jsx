import axios from "../utils/axiosCustomize.jsx"

const getUser = () => {
    return axios.get("api/users/profile");
}

const updateProfile = async (payload) => {
    const res = await axios.patch("api/users/profile", payload);
    return res;
};

const updateAvatar = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file); // field name phải khớp upload.single("avatar") ở backend

    // Gửi FormData (axios sẽ tự set Content-Type: multipart/form-data)
    const res = await axios.put("api/users/upload-image", formData);
    return res.data;
};

export {getUser, updateAvatar, updateProfile}