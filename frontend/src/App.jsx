import Layout from "./components/Layout.jsx";
import {Route, Routes} from "react-router-dom";
import HomePage from "./components/Home/HomePage.jsx";
import Login from "./components/Auth/Login.jsx";
import 'react-toastify/dist/ReactToastify.css';
import {Bounce, ToastContainer} from "react-toastify";
import SignUp from "./components/Auth/SignUp.jsx";
import AuthOtp from "./components/Auth/AuthOtp.jsx";
import ForgotPassword from "./components/Auth/ForgotPassword.jsx";
import ResetPassword from "./components/Auth/ResetPassword.jsx";

function App() {
  return (
    <>
        <Routes>
            <Route path="/" element={<Layout/>}>
                <Route index element={<HomePage/>}/>
            </Route>
            <Route path="/login" element={<Login/>}/>
            <Route path="/signup" element={<SignUp/>}/>
            <Route path="/otp" element={<AuthOtp/>}/>
            <Route path="/forgotpassword" element={<ForgotPassword/>}/>
            <Route path="/resetpassword" element={<ResetPassword/>}/>
        </Routes>
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
        />
    </>
  );
}

export default App
