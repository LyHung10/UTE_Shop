import Layout from "./Layout.jsx";
import { Route, Routes } from "react-router-dom";
import HomePage from "./features/home/pages/HomePage.jsx";
import Login from "./features/auth/pages/Login.jsx";
import 'react-toastify/dist/ReactToastify.css';
import { Bounce, ToastContainer } from "react-toastify";
import SignUp from "./features/auth/pages/SignUp.jsx";
import AuthOtp from "./features/auth/components/AuthOtp.jsx";
import ForgotPassword from "./features/auth/components/ForgotPassword.jsx";
import ResetPassword from "./features/auth/components/ResetPassword.jsx";
import UserProfile from "@/features/user/UserProfile.jsx";
import ProductDetail from "@/features/product/ProductDetail.jsx";
import ProductCategories from "@/features/product/pages/ProductCategories.jsx";
import ShoppingCart from "@/features/cart/pages/ShoppingCart.jsx";
import CheckoutPage from "@/features/checkout/pages/CheckoutPage.jsx";
import PaymentCompleted from "@/features/checkout/pages/PaymentCompleted.jsx";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path=":category" element={<ProductCategories />} />
          <Route path="cart" element={<ShoppingCart />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="payment/completed" element={<PaymentCompleted />} />

        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/otp" element={<AuthOtp />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
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
