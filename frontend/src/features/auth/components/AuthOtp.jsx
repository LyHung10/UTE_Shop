import {useEffect, useState} from 'react';
import {postAuthOtp} from "../../../services/apiService.jsx";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";
import {authOTP} from "../../../redux/action/authOtpAction.jsx";

const AuthOtp = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const authOtp = useSelector(state => state.auth.authOtp);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleOtpChange = (event, index) => {
        const newOtp = [...otp];
        newOtp[index] = event.target.value;
        setOtp(newOtp);
    };
    const handleSubmit = async() => {
        const fullOtp = otp.join('');
        console.log("Giá trị OTP:", fullOtp);
        if (!authOtp.isForgotPassword)
        {
            let data = await postAuthOtp(authOtp.email, fullOtp);
            if (data.message==="Xác thực thành công" && data) {
                toast.success(`${data.message}, Tài khoản đã được tạo`);
                navigate("/")
            }
            if (data && data.message!=="Xác thực thành công") {
                toast.error(data.message);
            }
        }
        if (authOtp.isForgotPassword)
        {
            dispatch(authOTP({
                ...authOtp,
                otp:fullOtp,
                isForgotPassword: false
            }));
            navigate("/resetpassword")
        }
    };

    useEffect(() => {
        const form = document.getElementById('otp-form');
        if (!form) return;

        const inputs = [...form.querySelectorAll('input[type=text]')];
        const submit = form.querySelector('button[type=submit]');

        const handleKeyDown = (e) => {
            if (
                !/^[0-9]{1}$/.test(e.key) &&
                e.key !== 'Backspace' &&
                e.key !== 'Delete' &&
                e.key !== 'Tab' &&
                !e.metaKey
            ) {
                e.preventDefault();
            }

            if (e.key === 'Delete' || e.key === 'Backspace') {
                const index = inputs.indexOf(e.target);

                // Xóa giá trị của ô hiện tại
                e.target.value = '';

                // Nếu không phải ô đầu tiên, di chuyển con trỏ lên ô trước đó
                if (index > 0) {
                    inputs[index - 1].focus();
                }
            }
        };

        const handleInput = (e) => {
            const { target } = e;
            const index = inputs.indexOf(target);

            if (target.value) {
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                } else {
                    // Check if 'submit' element exists before calling focus()
                    if (submit) {
                        submit.focus();
                    }
                }
            }
        };

        const handleFocus = (e) => {
            e.target.select();
        };

        const handlePaste = (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text');
            if (!new RegExp(`^[0-9]{${inputs.length}}$`).test(text)) {
                return;
            }
            const digits = text.split('');
            inputs.forEach((input, index) => (input.value = digits[index]));
            submit.focus();
        };

        inputs.forEach((input) => {
            input.addEventListener('input', handleInput);
            input.addEventListener('keydown', handleKeyDown);
            input.addEventListener('focus', handleFocus);
            input.addEventListener('paste', handlePaste);
        });

        // Cleanup event listeners when the component unmounts
        return () => {
            inputs.forEach((input) => {
                input.removeEventListener('input', handleInput);
                input.removeEventListener('keydown', handleKeyDown);
                input.removeEventListener('focus', handleFocus);
                input.removeEventListener('paste', handlePaste);
            });
        };
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="max-w-md mx-auto text-center bg-white px-4 sm:px-8 py-10 rounded-xl shadow">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold mb-1">Mobile Phone Verification</h1>
                    <p className="text-[15px] text-slate-500">Enter the 6-digit verification code that was sent to your
                        phone number.</p>
                </header>
                <form id="otp-form">
                    <div className="flex items-center justify-center gap-3">
                        {otp.map((value, index) => (
                            <input
                                key={index}
                                type="text"
                                className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                maxLength="1"
                                value={value}
                                onChange={(event) => handleOtpChange(event, index)}
                            />
                        ))}
                    </div>
                    <div className="max-w-[260px] mx-auto mt-4">
                        <button type="button"
                                onClick={()=>{handleSubmit()}}
                                className="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-indigo-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-300 focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-300 transition-colors duration-150">Verify
                            Account
                        </button>
                    </div>
                </form>
                <div className="text-sm text-slate-500 mt-4">Didn't receive code? <a
                    className="font-medium text-indigo-500 hover:text-indigo-600" href="#0">Resend</a></div>
            </div>
        </div>
    );
};

export default AuthOtp;