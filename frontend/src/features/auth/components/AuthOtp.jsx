import { useEffect, useState, useRef } from 'react';
import { postAuthOtp } from "../../../services/authService.jsx";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { authOTP } from "../../../redux/action/authOtpAction.jsx";

const AuthOtp = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const authOtp = useSelector(state => state.auth.authOtp);
    const inputRefs = useRef([]);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Xử lý nhập OTP
    const handleOtpChange = (event, index) => {
        const value = event.target.value;
        
        // Chỉ cho phép nhập số
        if (!/^\d*$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Tự động chuyển sang ô tiếp theo khi nhập
        if (value !== '' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Xử lý xóa OTP
    const handleKeyDown = (event, index) => {
        if (event.key === 'Backspace') {
            if (otp[index] === '' && index > 0) {
                // Nếu ô hiện tại trống, xóa ô trước đó
                inputRefs.current[index - 1].focus();
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
            } else {
                // Xóa ô hiện tại
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
            event.preventDefault();
        }
    };

    // Xử lý paste OTP
    const handlePaste = (event) => {
        event.preventDefault();
        const pasteData = event.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pasteData)) {
            const newOtp = pasteData.split('').slice(0, 6);
            while (newOtp.length < 6) newOtp.push('');
            setOtp(newOtp);
            
            // Focus vào ô cuối cùng
            const lastFilledIndex = newOtp.findIndex(val => val === '') - 1;
            const focusIndex = lastFilledIndex >= 0 ? lastFilledIndex : 5;
            inputRefs.current[focusIndex].focus();
        }
    };

    // Gửi lại OTP
    const handleResendOtp = async () => {
        if (countdown > 0) return;
        
        setIsLoading(true);
        try {
            // Gọi API gửi lại OTP ở đây
            // await resendOtp(authOtp.email);
            toast.success("Mã OTP mới đã được gửi đến email của bạn");
            setCountdown(60); // 60 giây
        } catch (error) {
            toast.error("Có lỗi xảy ra khi gửi lại mã OTP");
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý submit OTP
    const handleSubmit = async () => {
        const fullOtp = otp.join('');
        
        // Kiểm tra OTP đã nhập đủ
        if (fullOtp.length !== 6) {
            toast.error("Vui lòng nhập đủ 6 chữ số mã OTP");
            return;
        }

        setIsLoading(true);
        try {
            if (!authOtp.isForgotPassword) {
                let data = await postAuthOtp(authOtp.email, fullOtp);
                if (data.message === "Xác thực thành công" && data) {
                    toast.success(`${data.message}, Tài khoản đã được tạo thành công!`);
                    navigate("/");
                } else if (data && data.message !== "Xác thực thành công") {
                    toast.error(data.message);
                }
            } else {
                dispatch(authOTP({
                    ...authOtp,
                    otp: fullOtp,
                    isForgotPassword: false
                }));
                navigate("/resetpassword");
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi xác thực OTP");
        } finally {
            setIsLoading(false);
        }
    };

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Auto focus first input
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="bg-white rounded-full p-4 shadow-lg inline-flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        Xác thực OTP
                    </h1>
                    <p className="text-gray-600 mb-2">
                        Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến
                    </p>
                    <p className="text-indigo-600 font-semibold text-lg">
                        {authOtp.email || 'your-email@example.com'}
                    </p>
                </div>

                {/* OTP Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="space-y-6">
                        {/* OTP Inputs */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                                Nhập mã OTP
                            </label>
                            <div className="flex justify-center gap-3 mb-2">
                                {otp.map((value, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => inputRefs.current[index] = el}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength="1"
                                        value={value}
                                        onChange={(event) => handleOtpChange(event, index)}
                                        onKeyDown={(event) => handleKeyDown(event, index)}
                                        onPaste={index === 0 ? handlePaste : undefined}
                                        className="w-14 h-14 text-center text-2xl font-bold text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200"
                                        autoComplete="one-time-code"
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-4">
                                Không nhận được mã?{' '}
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={countdown > 0 || isLoading}
                                    className={`font-medium ${
                                        countdown > 0 || isLoading
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-indigo-600 hover:text-indigo-800'
                                    } transition-colors duration-200`}
                                >
                                    {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã OTP'}
                                </button>
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading || otp.join('').length !== 6}
                            className={`w-full py-4 px-4 rounded-xl font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                                isLoading || otp.join('').length !== 6
                                    ? 'bg-indigo-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
                            }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xác thực...
                                </div>
                            ) : (
                                'Xác thực OTP'
                            )}
                        </button>
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start space-x-2">
                            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-left">
                                <p className="text-sm text-blue-800 font-medium mb-1">Lưu ý quan trọng</p>
                                <p className="text-xs text-blue-600">
                                    • Mã OTP có hiệu lực trong 5 phút
                                    <br />
                                    • Kiểm tra cả hộp thư spam nếu không thấy email
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Link */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Quay lại trang trước
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthOtp;