import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {getUser, postLogin} from "../../../services/apiService.jsx";
import {toast} from "react-toastify";
import {useDispatch} from "react-redux";
import {doLogin} from "../../../redux/action/userAction.jsx";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const handleLogin = async () => {
        let data = await postLogin(email, password);
        if (data.accessToken && data.refreshToken) {
            dispatch(doLogin(data));
            toast.success("Đăng nhập thành công");
            // await props.fetchListUsers();)
            let user = await getUser(data.accessToken);
            dispatch(doLogin(user));
            console.log(user);
            navigate("/")
        }
        if (data && data.message) {
            toast.error(data.message);
        }
    }
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 lg:px-8 bg-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <img
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                    alt="Your Company"
                    className="mx-auto h-12 w-auto"
                />
                <h2 className="mt-10 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                <form action="#" method="POST" className="space-y-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-900">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                type="email"
                                name="email"
                                onChange={(event)=>{setEmail(event.target.value)}}
                                required
                                autoComplete="email"
                                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-900"
                            >
                                Password
                            </label>
                            <div className="text-sm">
                                <a
                                    href="/forgotpassword"
                                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                                >
                                    Forgot password?
                                </a>
                            </div>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                type="password"
                                name="password"
                                onChange={(event)=>{setPassword(event.target.value)}}
                                required
                                autoComplete="current-password"
                                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={()=>handleLogin(email,password)}
                            className="w-full text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                            Sign in
                        </button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm text-gray-600">
                    Not a member?{" "}
                    <a href="/public"
                        className="font-semibold text-indigo-600 hover:text-indigo-500">Go home
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
