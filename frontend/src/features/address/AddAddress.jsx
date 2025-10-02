import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Save, Home, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '@/utils/axiosCustomize';

const AddAddress = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        address_line: '',
        city: '',
        district: '',
        ward: '',
        postal_code: '',
        is_default: false
    });

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingProvinces, setLoadingProvinces] = useState(true);

    useEffect(() => {
        fetchProvinces();
    }, []);

    const fetchProvinces = async () => {
        try {
            const response = await fetch('https://provinces.open-api.vn/api/v2/?depth=2');
            const data = await response.json();
            setProvinces(data);
        } catch (error) {
            console.error('Error fetching provinces:', error);
            setProvinces([
                { code: 1, name: 'Hà Nội' },
                { code: 79, name: 'Hồ Chí Minh' },
                { code: 48, name: 'Đà Nẵng' },
                { code: 92, name: 'Cần Thơ' },
                { code: 74, name: 'Bình Dương' },
                { code: 60, name: 'Đồng Nai' },
                { code: 99, name: 'Hải Phòng' },
            ]);
        } finally {
            setLoadingProvinces(false);
        }
    };

    const fetchDistricts = async (provinceCode) => {
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const data = await response.json();
            setDistricts(data.districts || []);
            setWards([]);
        } catch (error) {
            console.error('Error fetching districts:', error);
        }
    };

    const fetchWards = async (districtCode) => {
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            const data = await response.json();
            setWards(data.wards || []);
        } catch (error) {
            console.error('Error fetching wards:', error);
        }
    };

    const handleProvinceChange = (e) => {
        const provinceCode = e.target.value;
        const selectedProvince = provinces.find(p => p.code == provinceCode);

        setFormData({
            ...formData,
            city: selectedProvince?.name || '',
            district: '',
            ward: ''
        });

        setDistricts([]);
        setWards([]);

        if (provinceCode) {
            fetchDistricts(provinceCode);
        }
    };

    const handleDistrictChange = (e) => {
        const districtCode = e.target.value;
        const selectedDistrict = districts.find(d => d.code == districtCode);

        setFormData({
            ...formData,
            district: selectedDistrict?.name || '',
            ward: ''
        });

        setWards([]);

        if (districtCode) {
            fetchWards(districtCode);
        }
    };

    const handleWardChange = (e) => {
        const wardCode = e.target.value;
        const selectedWard = wards.find(w => w.code == wardCode);

        setFormData({
            ...formData,
            ward: selectedWard?.name || ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('api/address', formData);
            navigate('/cart');
        } catch (error) {
            console.error('Error adding address:', error);
            alert('Có lỗi xảy ra khi thêm địa chỉ. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <button
                    onClick={() => navigate('/cart')}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all mb-8 group"
                >
                    <div className="p-2 rounded-xl bg-white shadow-sm group-hover:shadow-md transition-all group-hover:-translate-x-1">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Quay lại giỏ hàng</span>
                </button>

                {/* Form Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                                <Home className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1">Thêm địa chỉ mới</h1>
                                <p className="text-white/90 text-sm">Điền thông tin để hoàn tất giao hàng</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">

                        {/* Tên người nhận */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Họ và tên người nhận <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name_order"
                                value={formData.name_order}
                                onChange={handleInputChange}
                                required
                                placeholder="Ví dụ: Nguyễn Văn A"
                                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl 
               focus:outline-none focus:ring-4 focus:ring-indigo-100 
               focus:border-indigo-400 transition-all text-gray-900 
               placeholder-gray-400"
                            />
                        </div>

                        {/* Số điện thoại người nhận */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Số điện thoại <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="phone_order"
                                value={formData.phone_order}
                                onChange={handleInputChange}
                                required
                                placeholder="Ví dụ: 0901234567"
                                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl 
               focus:outline-none focus:ring-4 focus:ring-indigo-100 
               focus:border-indigo-400 transition-all text-gray-900 
               placeholder-gray-400"
                            />
                        </div>

                        {/* Địa chỉ cụ thể */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Địa chỉ cụ thể <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-indigo-500" />
                                <input
                                    type="text"
                                    name="address_line"
                                    value={formData.address_line}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Ví dụ: 123 Đường Lê Lợi, Tòa nhà ABC..."
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-gray-900 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Grid Layout for Location Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Tỉnh/Thành phố */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                                </label>
                                {loadingProvinces ? (
                                    <div className="flex items-center gap-3 text-gray-500 p-4 bg-gray-50 rounded-2xl">
                                        <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
                                        Đang tải...
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <select
                                            value={provinces.find(p => p.name === formData.city)?.code || ''}
                                            onChange={handleProvinceChange}
                                            required
                                            className="w-full appearance-none px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-gray-900 bg-white cursor-pointer"
                                        >
                                            <option value="">Chọn tỉnh/thành phố</option>
                                            {provinces.map((province) => (
                                                <option key={province.code} value={province.code}>
                                                    {province.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quận/Huyện */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                    Quận/Huyện <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={districts.find(d => d.name === formData.district)?.code || ''}
                                        onChange={handleDistrictChange}
                                        required
                                        disabled={!formData.city}
                                        className="w-full appearance-none px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-gray-900 bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                                    >
                                        <option value="">Chọn quận/huyện</option>
                                        {districts.map((district) => (
                                            <option key={district.code} value={district.code}>
                                                {district.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Phường/Xã */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                    Phường/Xã <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={wards.find(w => w.name === formData.ward)?.code || ''}
                                        onChange={handleWardChange}
                                        required
                                        disabled={!formData.district}
                                        className="w-full appearance-none px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-gray-900 bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                                    >
                                        <option value="">Chọn phường/xã</option>
                                        {wards.map((ward) => (
                                            <option key={ward.code} value={ward.code}>
                                                {ward.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Mã bưu điện */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                    Mã bưu điện
                                </label>
                                <input
                                    type="text"
                                    name="postal_code"
                                    value={formData.postal_code}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: 700000"
                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-gray-900 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Đặt làm mặc định */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border-2 border-blue-100">
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="is_default"
                                        checked={formData.is_default}
                                        onChange={handleInputChange}
                                        className="w-6 h-6 text-indigo-600 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer"
                                    />
                                    {formData.is_default && (
                                        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" />
                                    )}
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-gray-900 block">
                                        Đặt làm địa chỉ mặc định
                                    </span>
                                    <span className="text-xs text-gray-600">
                                        Địa chỉ này sẽ được chọn tự động cho đơn hàng tiếp theo
                                    </span>
                                </div>
                            </label>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/cart')}
                                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Đang thêm...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Lưu địa chỉ
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview Card */}
                {formData.address_line && formData.city && formData.district && formData.ward && (
                    <div className="mt-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-3xl p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-emerald-900 mb-3 flex items-center gap-2">
                                    Xem trước địa chỉ
                                    <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">✓</span>
                                </h3>
                                <p className="text-emerald-800 font-medium leading-relaxed">
                                    {formData.address_line}, {formData.ward}, {formData.district}, {formData.city}
                                    {formData.postal_code && `, ${formData.postal_code}`}
                                </p>
                                {formData.is_default && (
                                    <div className="mt-3 inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                                        <Sparkles className="w-3 h-3" />
                                        Địa chỉ mặc định
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddAddress;