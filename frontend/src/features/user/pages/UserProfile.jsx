import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateAvatar, updateProfile } from "@/services/userService.jsx";
import { fetchUser } from "@/redux/action/userAction.jsx";
import { toast } from "react-toastify";

export default function ProfilePage() {
    const user = useSelector((state) => state.user);

    const [avatarUrl, setAvatarUrl] = useState(user?.image);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const dispatch = useDispatch();
    const [selectedFile, setSelectedFile] = useState(null);
    const [savingAvatar, setSavingAvatar] = useState(false);
    const [savingInfo, setSavingInfo] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [form, setForm] = useState({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        phone: user?.phone_number || "",
        email: user?.email || "",
    });

    const fileInputRef = useRef(null);

    const onPickAvatar = () => fileInputRef.current?.click();

    const onAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setErrorMsg("Vui lòng chọn file ảnh hợp lệ.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrorMsg("Ảnh tối đa 5MB.");
            return;
        }

        const url = URL.createObjectURL(file);
        setAvatarUrl(url);
        setSelectedFile(file);
        setErrorMsg("");
    };

    const onOpenEdit = () => {
        setForm({
            first_name: user?.first_name || "",
            last_name: user?.last_name || "",
            phone: user?.phone_number || "",
            email: user?.email || "",
        });
        setIsEditOpen(true);
    };

    const onCloseEdit = () => {
        // hủy mọi thay đổi (revert về user)
        setForm({
            first_name: user?.first_name || "",
            last_name: user?.last_name || "",
            phone: user?.phone_number || "",
            email: user?.email || "",
        });
        setIsEditOpen(false);
    };
    const onChange = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

    // 🔹 Gọi API để upload avatar
    const handleSaveAvatar = async () => {
        if (!selectedFile) return;
        try {
            setSavingAvatar(true);
            setErrorMsg("");
            const updated = await updateAvatar(selectedFile); // gọi API upload
            if (updated?.image) setAvatarUrl(updated.image); // backend trả image url
            setSelectedFile(null);
        } catch (e) {
            setErrorMsg(e?.response?.data?.message || "Upload avatar thất bại");
        } finally {
            setSavingAvatar(false);
        }
    };

    useEffect(() => {
        dispatch(fetchUser());
        if (!savingAvatar && !savingInfo && !selectedFile) {
            dispatch(fetchUser());
        }
    }, [savingAvatar, savingInfo, selectedFile]);

    const handleCancelAvatar = () => {
        setAvatarUrl(user?.image || "https://i.pravatar.cc/160");
        setSelectedFile(null);
    };

    const onSave = async () => {
        setSavingInfo(true);
        setErrorMsg("");
        const result = await updateProfile({
            first_name: form.first_name,
            last_name: form.last_name,
            phone_number: form.phone, // chú ý đúng key
        });
        console.log(result);
        if (result.success === false) toast.info(result.message)
        else toast.success(result.message)
        setIsEditOpen(false);
        setSavingInfo(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 relative overflow-hidden">
            {/* Header */}
            <div className="relative w-full h-18 bg-gradient-to-r" />

            <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 -mt-12 pb-10 space-y-6">
                {/* Card profile */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={onPickAvatar}
                                className="relative group rounded-full ring-4 ring-white shadow-lg"
                                disabled={savingAvatar}
                            >
                                <div className="relative h-30 w-30 rounded-full p-[2px] bg-gradient-to-br from-indigo-500 to-fuchsia-500">
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                </div>
                                <span className="absolute inset-0 hidden group-hover:flex items-center justify-center rounded-full bg-black/35 text-white text-xs font-medium">
                                    Đổi ảnh
                                </span>
                            </button>

                            {/* Khi có file mới */}
                            {selectedFile && (
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                                    <button
                                        onClick={handleCancelAvatar}
                                        className="px-3 py-1 rounded-full border text-xs bg-white hover:bg-gray-50"
                                        disabled={savingAvatar}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveAvatar}
                                        className="px-3 py-1 rounded-full text-xs bg-gray-900 text-white hover:bg-black disabled:opacity-60"
                                        disabled={savingAvatar}
                                    >
                                        {savingAvatar ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onAvatarChange}
                        />

                        <div>
                            <h2 className="text-xl font-semibold">
                                {(user?.first_name || form.first_name) +
                                    " " +
                                    (user?.last_name || form.last_name)}
                            </h2>
                            <p className="text-gray-600">{user?.email || form.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={onOpenEdit}
                        className="px-4 py-2 rounded-full border text-gray-700 hover:bg-gray-100"
                    >
                        Sửa
                    </button>
                </div>

                {/* Thông tin cá nhân */}
                <section className="bg-white rounded-2xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Thông tin cá nhân</h3>
                        {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Field label="First Name" value={user?.first_name} />
                        <Field label="Last Name" value={user?.last_name} />
                        <Field label="Phone" value={user?.phone_number} />
                        <Field label="Email" value={user?.email} />
                    </div>
                </section>
            </main>

            {/* Modal edit */}
            <Modal open={isEditOpen} onClose={onCloseEdit}>
                <div className="p-4 sm:p-6">
                    <h4 className="text-xl font-semibold mb-4">Chỉnh sửa thông tin</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <LabeledInput label="First Name" value={form.first_name} onChange={onChange("first_name")} />
                        <LabeledInput label="Last Name" value={form.last_name} onChange={onChange("last_name")} />
                        <LabeledInput label="Phone" value={form.phone} onChange={onChange("phone")} />
                        <LabeledInput disabled label="Email" value={form.email} />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={onCloseEdit}
                            className="px-4 py-2 rounded-full border hover:bg-gray-50"
                            disabled={savingInfo}
                        >
                            Close
                        </button>
                        <button
                            onClick={() => onSave()}
                            className="px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-black disabled:opacity-60"
                            disabled={savingInfo}
                        >
                            {savingInfo ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function Field({ label, value }) {
    return (
        <div className="space-y-1">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-gray-900 font-medium">{value || "—"}</p>
        </div>
    );
}

function LabeledInput({ label, ...props }) {
    return (
        <label className="block">
            <span className="text-sm text-gray-600">{label}</span>
            <input
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
                {...props}
            />
        </label>
    );
}

function Modal({ open, onClose, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">{children}</div>
        </div>
    );
}
