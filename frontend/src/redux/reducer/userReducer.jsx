import {GET_PROFILE_USER} from "@/redux/action/actionTypes.js";

const INITIAL_STATE = {
    first_name: "",
    last_name: "",
    email: "",
    phone_number: null,
    gender: null,
    image: null,
};

const authReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case  GET_PROFILE_USER:
            return {
                ...state,
                first_name: action.payload.first_name,
                last_name: action.payload.last_name,
                email: action.payload.email,
                phone_number: action.payload.phone_number,
                gender: action.payload.gender,
                image: action.payload.image,
            };

        default:
            return state;
    }
};

export default authReducer;
