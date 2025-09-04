import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {toast} from "react-toastify";
import {postSignup} from "../../../services/apiService.jsx";
import {useDispatch} from "react-redux";
import {authOTP} from "../../../redux/action/authOtpAction.jsx";

const SignUp = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [email,setEmail] = useState("");
    const [confirmPassword,setConfirmPassword] = useState("");
    const [password,setPassword] = useState("");
    const handleCreateAccount = async() =>
    {
        if (password && confirmPassword && password===confirmPassword)
        {
            let data = await postSignup(email, password);
            if (data.message==="Đã gửi OTP tới email" && data) {
                dispatch(authOTP({email: email}));
                toast.success(data.message);
                navigate("/otp")
            }
            if (data && data.message!=="Đã gửi OTP tới email") {
                toast.error(data.message);
            }
        }
        else
        {
            toast.error("Mật khẩu chưa khớp hoặc chưa điền đầy đủ mật khẩu");
        }

    }
    return (
        <div>
            <section className="bg-gray-50">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <h3 className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-6">
                        Sign up
                    </h3>
                    <div
                        className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h3 className="text-l font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                                Create an account
                            </h3>
                            <form className="space-y-4 md:space-y-6" action="#">
                                <div>
                                    <label htmlFor="email"
                                           className="block mb-2 text-sm font-medium text-gray-900">Your
                                        email</label>
                                    <input type="email" name="email" id="email"
                                           onChange={(event)=>setEmail(event.target.value)}
                                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                           placeholder="name@company.com" required=""/>
                                </div>
                                <div>
                                    <label htmlFor="password"
                                           className="block mb-2 text-sm font-medium text-gray-900">Password</label>
                                    <input type="password" name="password" id="password" placeholder="••••••••"
                                           onChange={(event)=>setPassword(event.target.value)}
                                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                           required=""/>
                                </div>
                                <div>
                                    <label htmlFor="confirm-password"
                                           className="block mb-2 text-sm font-medium text-gray-900">Confirm
                                        password</label>
                                    <input type="password" name="confirm-password" id="confirm-password"
                                           placeholder="••••••••"
                                           onChange={(event)=>setConfirmPassword(event.target.value)}
                                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                           required=""/>
                                </div>
                                <button type="button"
                                        onClick={()=>handleCreateAccount()}
                                        className="w-full text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                    Create an account
                                </button>
                                <p className="text-sm font-light text-gray-500">
                                    Already have an account? <a href="/pages/Login"
                                                                className="font-medium text-primary-600 hover:underline">Login
                                    here</a>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
export default SignUp;