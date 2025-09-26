import { combineReducers } from 'redux';
import userReducer from "./userReducer.jsx";
import authOtpReducer from "./authOtpReducer.jsx";
import cartReducer from "./cartReducer.jsx";
import favoriteReducer from "./favoriteReducer.jsx";
const rootReducer = combineReducers({
    user: userReducer,
    auth: authOtpReducer,
    cart: cartReducer,
    favorite: favoriteReducer,
});

export default rootReducer;