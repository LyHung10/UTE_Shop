import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { postForgotPassword } from "../../../services/authService.jsx";
import { useDispatch, useSelector } from "react-redux";
import { authOTP } from "../../../redux/action/authOtpAction.jsx";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const authOtp = useSelector(state => state.auth.authOtp);
    const [emailForgotPassword, setEmailForgotPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        
        if (!emailForgotPassword) {
            newErrors.email = "Email là bắt buộc";
        } else if (!/\S+@\S+\.\S+/.test(emailForgotPassword)) {
            newErrors.email = "Email không hợp lệ";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleForgotPassword = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const data = await postForgotPassword(emailForgotPassword);
            
            if (data.message === "OTP đã được gửi" && data) {
                const newAuthOTP = {
                    ...authOtp,
                    email: emailForgotPassword,
                    isForgotPassword: true
                };
                dispatch(authOTP(newAuthOTP));

                toast.success("Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư!");
                navigate("/otp");
            } else if (data && data.message !== "OTP đã được gửi") {
                toast.error(data.message || "Có lỗi xảy ra, vui lòng thử lại!");
            }
        } catch (error) {
            toast.error("Không thể kết nối đến server. Vui lòng thử lại sau!");
            console.error("Forgot password error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleForgotPassword();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <Link 
                        to="/" 
                        className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-6"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Quay lại trang chủ
                    </Link>
                                        
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Quên mật khẩu
                    </h1>
                    <p className="text-gray-600 text-sm">
                        Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
                    </p>
                </div>

                {/* Card Form */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8">
                        <div className="space-y-6">
                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Địa chỉ email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={emailForgotPassword}
                                        onChange={(e) => {
                                            setEmailForgotPassword(e.target.value);
                                            if (errors.email) {
                                                setErrors({...errors, email: ""});
                                            }
                                        }}
                                        onKeyPress={handleKeyPress}
                                        className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200`}
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                disabled={isLoading}
                                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                                    isLoading 
                                        ? 'bg-indigo-400 cursor-not-allowed' 
                                        : 'bg-indigo-600 hover:bg-indigo-700 transform hover:-translate-y-0.5'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Gửi mã OTP
                                    </>
                                )}
                            </button>

                            {/* Additional Help Text */}
                            <div className="text-center">
                                <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                                    📧 Mã OTP sẽ được gửi đến email của bạn. 
                                    <br />Vui lòng kiểm tra cả hộp thư spam nếu không thấy email trong hộp thư chính.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
                        <div className="flex justify-center space-x-4 text-sm">
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200">
                                Quay lại đăng nhập
                            </Link>
                            <span className="text-gray-300">•</span>
                            <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200">
                                Đăng ký tài khoản mới
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500 flex items-center justify-center">
                        <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Thông tin của bạn được bảo mật và mã hóa
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;