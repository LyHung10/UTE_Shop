import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {toast} from "react-toastify";
import {postForgotPassword} from "../../services/apiService.jsx";
import {useDispatch, useSelector} from "react-redux";
import {authOTP} from "../../redux/action/authOtpAction.jsx";

const ForgotPassword = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const authOtp = useSelector(state => state.auth.authOtp);
    const [emailForgotPassword,setEmailForgotPassword] = useState("");
    const handleForgotPassword = async() =>
    {
        if (emailForgotPassword)
        {
            let data = await postForgotPassword(emailForgotPassword);
            if (data.message==="OTP đã được gửi" && data) {
                let newAuthOTP = {
                    ...authOtp,
                    email: emailForgotPassword,
                    isForgotPassword: true
                };
                console.log(newAuthOTP);
                dispatch(authOTP(newAuthOTP));

                toast.success(data.message);
                navigate("/otp")
            }
            if (data && data.message!=="OTP đã được gửi") {
                toast.error(data.message);
            }
        }
        else
        {
            toast.error("Email chưa được nhập!");
        }

    }
    return (
        <div>
            <section className="bg-gray-50">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 mt-40">
                    <h3 className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-6">
                        Forgot Password
                    </h3>
                    <div
                        className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <form className="space-y-4 md:space-y-6" action="#">
                                <div>
                                    <label htmlFor="email"
                                           className="block mb-2 text-sm font-medium text-gray-900">Your
                                        email</label>
                                    <input type="email" name="email" id="email"
                                           onChange={(event)=>setEmailForgotPassword(event.target.value)}
                                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                           placeholder="name@company.com" required=""/>
                                </div>
                                <button type="button"
                                        onClick={()=>handleForgotPassword()}
                                        className="w-full text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                    Send OTP
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
export default ForgotPassword;