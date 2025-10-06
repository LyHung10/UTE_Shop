import axios from "../utils/axiosCustomize.jsx"

const getUser = () => {
    return axios.get("api/users/profile");
}

export {getUser
}