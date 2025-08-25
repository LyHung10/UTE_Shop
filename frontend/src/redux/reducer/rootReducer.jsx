import {combineReducers} from 'redux';
import userReducer from "./userReducer.jsx";
import authOtpReducer from "./authOtpReducer.jsx";

const rootReducer = combineReducers({
    user: userReducer,
    auth: authOtpReducer
});

export default rootReducer;