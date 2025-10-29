import Layout from "./Layout.jsx";
import { Route, Routes } from "react-router-dom";
import HomePage from "./features/home/pages/HomePage.jsx";
import AuthOtp from "./features/auth/components/AuthOtp.jsx";
import ForgotPassword from "./features/auth/components/ForgotPassword.jsx";
import ResetPassword from "./features/auth/components/ResetPassword.jsx";
import UserProfile from "@/features/user/pages/UserProfile.jsx";
import AdminProfile from "@/admin/pages/UserProfiles.jsx";
import ProductDetail from "@/features/product/pages/ProductDetail.jsx";
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
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatAdminPanel from "./features/chat/ChatAdminPanel.jsx";
import PrivateRoute from "@/app/guards/PrivateRoute.jsx";
import AddAddress from "./features/address/AddAddress.jsx";
import AppLayout from "@/admin/layout/AdminLayout.jsx";
import Home from "@/admin/pages/Home.js";
import AdminNotificationSender from "./features/chat/NotificationSender.jsx";
import NotFound from "@/NotFound.jsx";
import SignIn from "@/features/auth/pages/SignIn.jsx";
import SignUp from "@/features/auth/pages/SignUp.jsx";
import Orders from "@/admin/pages/Manage/Orders.jsx";
import Users from "@/admin/pages/Manage/Users.jsx";
import SearchPage from "./features/product/pages/SearchPage.jsx";
import RewardStore from "@/features/user/pages/RewardStore.jsx";
import ChangePassword from "@/features/user/pages/ChangePassword.jsx";
import UserRoute from "@/app/guards/UserRoute.jsx";
import AdminRoute from "@/app/guards/AdminRoute.jsx";
import FlashSale from "./admin/pages/Manage/FlashSale.jsx";
import CreateFlashSale from "./admin/pages/Manage/CreateFlashSale.jsx";
import AddFlashSaleProducts from "./admin/pages/Manage/AddFlashSaleProducts.jsx";
import Categories from "@/admin/pages/Manage/Categories.jsx";
import Vouchers from "@/admin/pages/Manage/Vouchers.jsx";
import ProductList from "./admin/pages/Manage/ProductList.jsx";
import ProductForm from "./admin/pages/Manage/ProductForm.jsx";
import MyVoucher from "@/features/user/pages/MyVoucher.jsx";

function App() {
  return (
    <>
      <Routes>
        {/* ===== PUBLIC LAYOUT ===== */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />

          {/* Cần đăng nhập */}
          <Route element={<PrivateRoute />}>
            <Route element={<UserRoute />}>
              <Route path="user" element={<UserLayout />}>
                <Route index element={<UserProfile />} />
                <Route path="my-orders" element={<OrderHistory />} />
                <Route path="order-detail/:id" element={<OrderDetail />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="product-favorites" element={<FavoritesPage />} />
                <Route path="orders/:orderId/review" element={<ReviewPage />} />
                <Route path="gift" element={<RewardStore />} />
                <Route path="my-vouchers" element={<MyVoucher />} />
                <Route path="change-password" element={<ChangePassword />} />
              </Route>
              <Route path="cart" element={<ShoppingCart />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="payment/completed" element={<PaymentCompleted />} />
              <Route path="add/addresses" element={<AddAddress />} />
            </Route>
          </Route>

          {/* Public pages */}
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="category/:category" element={<ProductCategories />} />
          <Route path="tryon" element={<TryOnPage />} />
          <Route path="search" element={<SearchPage />} />
        </Route>

        {/* ===== ADMIN LAYOUT (TÁCH RIÊNG) ===== */}
        <Route element={<PrivateRoute />}>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="chat" element={<ChatAdminPanel />} />
              <Route path="notification" element={<AdminNotificationSender />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="manage-orders" element={<Orders />} />
              <Route path="manage-categories" element={<Categories />} />
              <Route path="manage-customers" element={<Users />} />
              <Route path="manage-flashsales" element={<FlashSale />} />
              <Route path="manage-flashsales/create" element={<CreateFlashSale />} />
              <Route path="manage-flashsales/:id/products" element={<AddFlashSaleProducts />} />
              <Route path="manage-products" element={<ProductList />} />
              <Route path="manage-vouchers" element={<Vouchers />} />
              <Route path="manage-products/add" element={<ProductForm />} />
              <Route path="manage-products/edit/:id" element={<ProductForm />} />
            </Route>
          </Route>
        </Route>


        {/* ===== AUTH (ngoài Layout) ===== */}
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/otp" element={<AuthOtp />} />
        <Route path="resetpassword" element={<ResetPassword />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer
        position="top-left"
        autoClose={1500}
        theme="light"
        transition={Bounce}
        style={{ zIndex: 99999 }}
      />
    </>
  );
}

export default App;
