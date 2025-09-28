import Layout from "./Layout.jsx";
import { Route, Routes } from "react-router-dom";
import HomePage from "./features/home/pages/HomePage.jsx";
import Login from "./features/auth/pages/Login.jsx";
import SignUp from "./features/auth/pages/SignUp.jsx";
import AuthOtp from "./features/auth/components/AuthOtp.jsx";
import ForgotPassword from "./features/auth/components/ForgotPassword.jsx";
import ResetPassword from "./features/auth/components/ResetPassword.jsx";
import UserProfile from "@/features/user/pages/UserProfile.jsx";
import ProductDetail from "@/features/product/ProductDetail.jsx";
import ProductCategories from "@/features/product/pages/ProductCategories.jsx";
import ShoppingCart from "@/features/cart/pages/ShoppingCart.jsx";
import CheckoutPage from "@/features/checkout/pages/CheckoutPage.jsx";
import PaymentCompleted from "@/features/checkout/pages/PaymentCompleted.jsx";
import UserLayout from "@/features/user/UserLayout.jsx";
import OrderHistory from "@/features/user/pages/OrderHistory.jsx";
import OrderDetail from "@/features/user/pages/OrderDetail.jsx";
import ReviewPage from "@/features/review/pages/ReviewPage.jsx";
import TryOnPage from "@/features/product/pages/Tryon.jsx";
import FavoritesPage from "./features/product/pages/FavoritesPage.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatAdminPanel from "./features/chat/ChatAdminPanel.jsx";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />

          {/* Các route cần đăng nhập */}
          {/* <Route element={<PrivateRoute />}> */}
          <Route path="user" element={<UserLayout />}>
            <Route index element={<UserProfile />} />
            <Route path="my-orders" element={<OrderHistory />} />
            <Route path="order-detail/:id" element={<OrderDetail />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="product-favorites" element={<FavoritesPage />} />
          </Route>
          <Route path="cart" element={<ShoppingCart />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="payment/completed" element={<PaymentCompleted />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="resetpassword" element={<ResetPassword />} />
          {/* </Route> */}

          {/* Route Admin */}
          <Route path="admin/chat" element={<ChatAdminPanel />} />


          {/* Route công khai */}
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path=":category" element={<ProductCategories />} />
          <Route path="tryon" element={<TryOnPage />} />
        </Route>

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/otp" element={<AuthOtp />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
      </Routes>

      <ToastContainer
        position="top-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
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

export default App;
