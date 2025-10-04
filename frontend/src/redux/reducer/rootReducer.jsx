import { combineReducers } from 'redux';
import authReducer from "./authReducer.jsx";
import authOtpReducer from "./authOtpReducer.jsx";
import cartReducer from "./cartReducer.jsx";
import favoriteReducer from "./favoriteReducer.jsx";
import userReducer from "@/redux/reducer/userReducer.jsx";
const rootReducer = combineReducers({
    authStatus: authReducer,
    user: userReducer,
    auth: authOtpReducer,
    cart: cartReducer,
    favorite: favoriteReducer,
});

export default rootReducer;