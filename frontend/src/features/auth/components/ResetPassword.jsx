import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {toast} from "react-toastify";
import {postResetPassword} from "../../../services/apiService.jsx";
import {useSelector} from "react-redux";

const ResetPassword = () => {
    const authOtp = useSelector(state => state.auth.authOtp);

    const navigate = useNavigate();

    const [password,setRassword] = useState("");
    const [confirmPassword,setConfirmPassword] = useState("");
    const handleResetPassword = async() =>
    {
        if (password && confirmPassword)
        {
            if (password !== confirmPassword)
            {
                toast.error("Mật khẩu chưa khớp");
            }
            else{
                let data = await postResetPassword(authOtp.email,authOtp.otp,password);
                if (data && data.message==="Password updated successfully")
                {
                    toast.success(data.message);
                    navigate("/")
                }
                if (data && data.message!=="Password updated successfully")
                {
                    toast.error(data.message);
                }
            }
        }
        else
        {
            toast.error("Ô nhập còn trống !!!");
        }
    }
    return (
        <div>
            <section className="bg-gray-50">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 mt-40">
                    <h3 className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-6">
                        Reset Password
                    </h3>
                    <div
                        className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <form className="space-y-4 md:space-y-6" action="#">
                                <div>
                                    <label htmlFor="email"
                                           className="block mb-2 text-sm font-medium text-gray-900">Mật khẩu</label>
                                    <input type="password" name="email" id="email"
                                           onChange={(event)=>setRassword(event.target.value)}
                                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                            required=""/>
                                </div>
                                <div>
                                    <label htmlFor="confirm-password"
                                           className="block mb-2 text-sm font-medium text-gray-900">Xác nhận lại mật khẩu</label>
                                    <input type="password" name="email" id="confirm-password"
                                           onChange={(event)=>setConfirmPassword(event.target.value)}
                                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                            required=""/>
                                </div>
                                <button type="button"
                                        onClick={()=>handleResetPassword()}
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
export default ResetPassword;