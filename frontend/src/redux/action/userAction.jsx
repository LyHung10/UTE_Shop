import {getUser} from "@/services/userService.jsx";
import {GET_PROFILE_USER} from "@/redux/action/actionTypes.js";


export const fetchUser = () => async (dispatch) => {
    try {
        const user = await getUser();
        if (user)
        {
            dispatch({
                type: GET_PROFILE_USER,
                payload: user
            });
        }
    } catch (err) {
        console.error("Error get user:", err)
    }
};

