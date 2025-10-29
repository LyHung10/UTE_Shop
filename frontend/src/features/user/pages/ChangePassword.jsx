import { useState } from "react";
import { toast } from "react-toastify";
import { postChangePassword } from "@/services/userService.jsx";
// import { changePassword } from "@/services/userService.jsx"; // TODO: nối API thật khi backend sẵn

export default function ChangePassword() {
    const [form, setForm] = useState({
        current: "",
        next: "",
        confirm: "",
    });
    const [show, setShow] = useState({
        current: false,
        next: false,
        confirm: false,
    });
    const [errors, setErrors] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // ✅ sửa lỗi nhập 1 ký tự: dùng e.preventDefault() và setForm trực tiếp
    const onChange = (k) => (e) => {
        const val = e.target.value;
        setForm((prev) => ({ ...prev, [k]: val }));
    };

    const validate = () => {
        const e = [];
        const { current, next, confirm } = form;
        if (!current.trim()) e.push("Vui lòng nhập mật khẩu hiện tại.");
        if (!next.trim()) e.push("Vui lòng nhập mật khẩu mới.");
        if (next && next.length < 8) e.push("Mật khẩu mới tối thiểu 8 ký tự.");
        const hasUpper = /[A-Z]/.test(next);
        const hasLower = /[a-z]/.test(next);
        const hasDigit = /\d/.test(next);
        const hasSymbol = /[^A-Za-z0-9]/.test(next);
        const strength = [hasUpper, hasLower, hasDigit, hasSymbol].filter(Boolean).length;
        if (next && strength < 3)
            e.push("Mật khẩu mới phải gồm ít nhất 3 trong 4 nhóm: chữ hoa, chữ thường, số, ký tự đặc biệt.");
        if (current && next && current === next)
            e.push("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
        if (confirm.trim() !== next.trim()) e.push("Xác nhận mật khẩu không khớp.");
        setErrors(e);
        return e.length === 0;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            const res = await postChangePassword(form.current, form.confirm);
            if (res.success === true) {
                toast.success(res.message);
                setForm({
                    current: "",
                    next: "",
                    confirm: "",
                })
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Đổi mật khẩu thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    const onReset = () => {
        setForm({ current: "", next: "", confirm: "" });
        setErrors([]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 relative overflow-hidden">
            {/* Header gradient nhẹ */}
            <div className="relative w-full h-20 bg-gradient-to-r" />

            <main className="w-full flex justify-center px-4 sm:px-6 -mt-12 pb-10">
                <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border p-8">
                    <h2 className="text-xl font-semibold mb-1">Đổi mật khẩu</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Đặt mật khẩu mạnh để bảo vệ tài khoản của bạn.
                    </p>

                    {errors.length > 0 && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            <ul className="list-disc ml-5 space-y-1">
                                {errors.map((er, idx) => (
                                    <li key={idx}>{er}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-5">
                        <Input
                            label="Mật khẩu hiện tại"
                            value={form.current}
                            onChange={onChange("current")}
                            onToggle={() => setShow((s) => ({ ...s, current: !s.current }))}
                            visible={show.current}
                            placeholder="••••••••"
                        />

                        <div>
                            <Input
                                label="Mật khẩu mới"
                                value={form.next}
                                onChange={onChange("next")}
                                onToggle={() => setShow((s) => ({ ...s, next: !s.next }))}
                                visible={show.next}
                                placeholder="Ít nhất 8 ký tự"
                            />
                            <StrengthBar password={form.next} />
                            <p className="mt-2 text-xs text-gray-500">
                                Gợi ý: kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt.
                            </p>
                        </div>

                        <Input
                            label="Xác nhận mật khẩu mới"
                            value={form.confirm}
                            onChange={onChange("confirm")}
                            onToggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                            visible={show.confirm}
                            placeholder="Nhập lại mật khẩu mới"
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onReset}
                                className="px-4 py-2 rounded-full border text-gray-700 hover:bg-gray-100"
                                disabled={submitting}
                            >
                                Làm mới
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-black disabled:opacity-60"
                                disabled={submitting}
                            >
                                {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

// ------------------ COMPONENTS ------------------

function Input({ label, value, onChange, visible, onToggle, placeholder }) {
    return (
        <label className="block w-full">
            <span className="text-sm text-gray-600">{label}</span>
            <div className="mt-1 relative w-full">
                <input
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-gray-900/10"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
                >
                    {visible ? "Ẩn" : "Hiện"}
                </button>
            </div>
        </label>
    );
}

function StrengthBar({ password }) {
    const bars = [
        /[a-z]/.test(password),
        /[A-Z]/.test(password),
        /\d/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ].filter(Boolean).length;

    return (
        <div className="mt-2 flex gap-1">
            {[0, 1, 2, 3].map((i) => (
                <div
                    key={i}
                    className={`h-1 flex-1 rounded ${i < bars ? "bg-gray-900" : "bg-gray-200"
                        }`}
                />
            ))}
        </div>
    );
}
