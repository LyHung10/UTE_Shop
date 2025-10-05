import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/admin/icons/index.js";
import Label from "@/admin/components/form/Label.jsx";
import Input from "@/admin/components/form/input/InputField.jsx";
import { useDispatch } from "react-redux";
import { postSignup } from "@/services/authService.jsx";
import { authOTP } from "@/redux/action/authOtpAction.jsx";
import { toast } from "react-toastify";
import { z } from "zod";

// ----- Zod schema -----
const signupSchema = z
    .object({
      email: z
          .string({ required_error: "Vui lòng nhập email" })
          .email("Email không hợp lệ"),
      password: z
          .string({ required_error: "Vui lòng nhập mật khẩu" })
          .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
          .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa (A-Z)")
          .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường (a-z)")
          .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số (0-9)")
          .regex(/[^A-Za-z0-9]/, "Mật khẩu phải có ít nhất 1 ký tự đặc biệt"),
      confirmPassword: z.string({ required_error: "Vui lòng nhập lại mật khẩu" }),
      fname: z.string().min(1, "Vui lòng nhập tên"),
      lname: z.string().min(1, "Vui lòng nhập họ"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Mật khẩu nhập lại không khớp",
    });

export default function SignUpForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ----- form state -----
  const [form, setForm] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // lỗi cho từng field
  const [errors, setErrors] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // ----- helpers -----
  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // validate theo field (gọi khi onChange để hiện lỗi ngay khi sai)
  const validateField = (name, value) => {
    let fieldError = "";

    // dựng schema chỉ cho field đó
    if (name === "email") {
      const res = signupSchema.shape.email.safeParse(value);
      if (!res.success) fieldError = res.error.issues[0]?.message || "Email không hợp lệ";
    }

    if (name === "password") {
      const res = signupSchema.shape.password.safeParse(value);
      if (!res.success) fieldError = res.error.issues[0]?.message || "Mật khẩu không hợp lệ";
      // khi mật khẩu thay đổi, kiểm tra luôn confirmPassword khớp hay không
      if (form.confirmPassword) {
        fieldError = fieldError; // giữ lỗi password nếu có
        const same = value === form.confirmPassword;
        setErrors((prev) => ({
          ...prev,
          confirmPassword: same ? "" : "Mật khẩu nhập lại không khớp",
        }));
      }
    }

    if (name === "confirmPassword") {
      if (!value) {
        fieldError = "Vui lòng nhập lại mật khẩu";
      } else if (value !== form.password) {
        fieldError = "Mật khẩu nhập lại không khớp";
      }
    }

    if (name === "fname") {
      fieldError = value ? "" : "Vui lòng nhập tên";
    }
    if (name === "lname") {
      fieldError = value ? "" : "Vui lòng nhập họ";
    }

    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  // kiểm tra cả form trước khi submit
  const validateAll = () => {
    const parsed = signupSchema.safeParse(form);
    if (parsed.success) {
      // clear hết lỗi nếu pass
      setErrors({
        fname: "",
        lname: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      return { ok: true };
    } else {
      // map lỗi theo field
      const newErrors = { fname: "", lname: "", email: "", password: "", confirmPassword: "" };
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field && newErrors[field] === "") {
          newErrors[field] = issue.message;
        }
      });
      setErrors(newErrors);
      return { ok: false, errors: newErrors };
    }
  };

  const handleCreateAccount = async () => {
    const { ok } = validateAll();
    if (!ok) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    // Nếu hợp lệ, gọi API
    const { email, password } = form;
    const data = await postSignup(email, password);

    if (data && data.message === "Đã gửi OTP tới email") {
      dispatch(authOTP({ email }));
      toast.success(data.message);
      navigate("/otp");
    } else if (data && data.message) {
      toast.error(data.message);
    } else {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  return (
      <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
        <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
          <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon className="size-5" />
            Back to home page
          </Link>
        </div>

        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Sign Up
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter your email and password to sign up!
              </p>
            </div>

            <div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
                <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg:white/5 dark:text-white/90 dark:hover:bg-white/10">
                  {/* Google */}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z" fill="#4285F4"/>
                    <path d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z" fill="#34A853"/>
                    <path d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z" fill="#FBBC05"/>
                    <path d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z" fill="#EB4335"/>
                  </svg>
                  Sign up with Google
                </button>

                <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                  {/* X */}
                  <svg width="21" className="fill-current" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.6705 1.875H18.4272L12.4047 8.75833L19.4897 18.125H13.9422L9.59717 12.4442L4.62554 18.125H1.86721L8.30887 10.7625L1.51221 1.875H7.20054L11.128 7.0675L15.6705 1.875ZM14.703 16.475H16.2305L6.37054 3.43833H4.73137L14.703 16.475Z" />
                  </svg>
                  Sign up with X
                </button>
              </div>

              <div className="relative py-3 sm:py-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">Or</span>
                </div>
              </div>

              <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateAccount();
                  }}
              >
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {/* First Name */}
                    <div className="sm:col-span-1">
                      <Label>
                        First Name<span className="text-error-500">*</span>
                      </Label>
                      <Input
                          type="text"
                          id="fname"
                          name="fname"
                          placeholder="Enter your first name"
                          value={form.fname}
                          onChange={(e) => {
                            setField("fname", e.target.value);
                            validateField("fname", e.target.value);
                          }}
                          error={!!errors.fname}
                          hint={errors.fname}
                          success={form.fname && !errors.fname}
                      />
                    </div>

                    {/* Last Name */}
                    <div className="sm:col-span-1">
                      <Label>
                        Last Name<span className="text-error-500">*</span>
                      </Label>
                      <Input
                          type="text"
                          id="lname"
                          name="lname"
                          placeholder="Enter your last name"
                          value={form.lname}
                          onChange={(e) => {
                            setField("lname", e.target.value);
                            validateField("lname", e.target.value);
                          }}
                          error={!!errors.lname}
                          hint={errors.lname}
                          success={form.lname && !errors.lname}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <Label>
                      Email<span className="text-error-500">*</span>
                    </Label>
                    <Input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={(e) => {
                          setField("email", e.target.value);
                          validateField("email", e.target.value);
                        }}
                        error={!!errors.email}
                        hint={errors.email}
                        success={form.email && !errors.email}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <Label>
                      Password<span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                          placeholder="Enter your password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={form.password}
                          onChange={(e) => {
                            setField("password", e.target.value);
                            validateField("password", e.target.value);
                          }}
                          error={!!errors.password}
                          hint={errors.password}
                          success={form.password && !errors.password}
                      />
                      <span
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                      {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <Label>
                      Password<span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                          placeholder="Enter your password"
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={(e) => {
                            setField("confirmPassword", e.target.value);
                            validateField("confirmPassword", e.target.value);
                          }}
                          error={!!errors.confirmPassword}
                          hint={errors.confirmPassword}
                          success={form.confirmPassword && !errors.confirmPassword}
                      />
                      <span
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                      {showConfirmPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                    </div>
                  </div>

                  {/* Button */}
                  <div>
                    <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                      Sign Up
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-5 mb-5">
                <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                  Already have an account?{" "}
                  <Link
                      to="/signin"  // (tuỳ bạn) đường dẫn hợp lý hơn cho "Sign In"
                      className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
