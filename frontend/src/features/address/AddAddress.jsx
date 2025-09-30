import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '@/utils/axiosCustomize';

const AddAddress = () => {
    const navigate = useNavigate();

    // State cho form
    const [formData, setFormData] = useState({
        address_line: '',
        city: '',
        district: '',
        ward: '',
        postal_code: '',
        is_default: false
    });

    // State cho danh sách địa chỉ Việt Nam
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingProvinces, setLoadingProvinces] = useState(true);

    // Fetch danh sách tỉnh/thành phố
    useEffect(() => {
        fetchProvinces();
    }, []);

    const fetchProvinces = async () => {
        try {
            // Sử dụng API từ ghnt.org (miễn phí)
            const response = await fetch('https://provinces.open-api.vn/api/v2/?depth=2');
            const data = await response.json();
            setProvinces(data);
        } catch (error) {
            console.error('Error fetching provinces:', error);
            // Fallback data nếu API lỗi
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

    // Fetch quận/huyện khi chọn tỉnh/thành phố
    const fetchDistricts = async (provinceCode) => {
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const data = await response.json();
            setDistricts(data.districts || []);
            setWards([]); // Reset wards khi chọn province mới
        } catch (error) {
            console.error('Error fetching districts:', error);
        }
    };

    // Fetch phường/xã khi chọn quận/huyện
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
            // Quay lại trang giỏ hàng sau khi thêm thành công
            navigate('/cart');
        } catch (error) {
            console.error('Error adding address:', error);
            alert('Có lỗi xảy ra khi thêm địa chỉ. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => navigate('/cart')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Quay lại giỏ hàng
                    </button>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <MapPin className="w-6 h-6 text-gray-800" />
                        <h1 className="text-2xl font-bold text-gray-900">Thêm địa chỉ mới</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Địa chỉ cụ thể */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Địa chỉ cụ thể <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="address_line"
                                value={formData.address_line}
                                onChange={handleInputChange}
                                required
                                placeholder="Ví dụ: 123 Đường Lê Lợi, Tòa nhà ABC..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors"
                            />
                        </div>

                        {/* Tỉnh/Thành phố */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tỉnh/Thành phố <span className="text-red-500">*</span>
                            </label>
                            {loadingProvinces ? (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                    Đang tải...
                                </div>
                            ) : (
                                <select
                                    value={provinces.find(p => p.name === formData.city)?.code || ''}
                                    onChange={handleProvinceChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors"
                                >
                                    <option value="">Chọn tỉnh/thành phố</option>
                                    {provinces.map((province) => (
                                        <option key={province.code} value={province.code}>
                                            {province.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Quận/Huyện */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quận/Huyện <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={districts.find(d => d.name === formData.district)?.code || ''}
                                onChange={handleDistrictChange}
                                required
                                disabled={!formData.city}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">Chọn quận/huyện</option>
                                {districts.map((district) => (
                                    <option key={district.code} value={district.code}>
                                        {district.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Phường/Xã */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phường/Xã <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={wards.find(w => w.name === formData.ward)?.code || ''}
                                onChange={handleWardChange}
                                required
                                disabled={!formData.district}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">Chọn phường/xã</option>
                                {wards.map((ward) => (
                                    <option key={ward.code} value={ward.code}>
                                        {ward.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Mã bưu điện */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mã bưu điện
                            </label>
                            <input
                                type="text"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleInputChange}
                                placeholder="Ví dụ: 700000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors"
                            />
                        </div>

                        {/* Đặt làm mặc định */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="is_default"
                                checked={formData.is_default}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-gray-800 border-gray-300 rounded focus:ring-gray-800"
                            />
                            <label className="text-sm text-gray-700">
                                Đặt làm địa chỉ mặc định
                            </label>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/cart')}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Đang thêm...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Thêm địa chỉ
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview */}
                {formData.address_line && formData.city && formData.district && formData.ward && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-900 mb-2">Xem trước địa chỉ:</h3>
                        <p className="text-blue-800">
                            {formData.address_line}, {formData.ward}, {formData.district}, {formData.city}
                            {formData.postal_code && `, ${formData.postal_code}`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddAddress;