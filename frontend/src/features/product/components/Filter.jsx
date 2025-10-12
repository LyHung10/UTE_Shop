import FilterType from "@/features/product/components/FilterType.jsx";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const VND = new Intl.NumberFormat("vi-VN");

export default function Filter({
                                   // ✅ options từ API
                                   colorOptions = [],
                                   sizeOptions = [],

                                   selectedColors = [],
                                   onToggleColor = () => {},
                                   selectedSizes = [],
                                   onToggleSize = () => {},
                                   priceMin = 0,
                                   priceMax = 5000000,
                                   onPriceChange = () => {},
                               }) {
    const ABS_MIN = 0;
    const ABS_MAX = 5000000;
    const STEP = 10000;

    // cập nhật giá khi kéo slider
    const handleRangeChange = (values) => {
        const [min, max] = values;
        onPriceChange({ min, max });
    };

    return (
        <aside className="hidden lg:block bg-white sticky top-24 self-start rounded-lg shadow-sm border border-gray-100">
            {/* Header */}
            <div className="px-3 py-3 border-b">
                <b>Bộ lọc tìm kiếm</b>
            </div>

            {/* Nội dung */}
            <div
                className="max-h-[calc(100vh-6rem-3.5rem)] overflow-y-auto px-4 py-3
        [&::-webkit-scrollbar]:w-[4px]
        [&::-webkit-scrollbar-thumb]:bg-gray-400
        [&::-webkit-scrollbar-thumb]:rounded
        [&::-webkit-scrollbar-track]:bg-transparent"
            >
                {/* ==== PRICE RANGE ==== */}
                <div className="mb-3">
                    <div className="mb-2 text-sm font-medium text-gray-800">Khoảng giá</div>

                    {/* Ô hiển thị giá – compact pills */}
                    <div className="flex items-center gap-1 mb-2">
                        <input
                            readOnly
                            value={`${VND.format(priceMin)}đ`}
                            className="h-8 w-[80px] rounded-md border border-gray-300 bg-white
                  text-[13px] text-center text-gray-900 shadow-sm focus:outline-none"
                        />
                        <div className="h-px w-4 bg-gray-300" />
                        <input
                            readOnly
                            value={`${VND.format(priceMax)}đ`}
                            className="h-8 w-[80px] rounded-md border border-gray-300 bg-white
                  text-[13px] text-gray-900 shadow-sm focus:outline-none text-center"
                        />
                    </div>

                    {/* rc-slider – compact track/handle */}
                    <div className="ml-2 px-0 py-1">
                        <Slider
                            range
                            min={ABS_MIN}
                            max={ABS_MAX}
                            step={STEP}
                            value={[priceMin, priceMax]}
                            onChange={handleRangeChange}
                            railStyle={{ backgroundColor: "#eee", height: 3 }}
                            trackStyle={[{ backgroundColor: "#1d4ed8", height: 3 }]}  // blue-700
                            handleStyle={[
                                {
                                    borderColor: "#1d4ed8",
                                    height: 14,
                                    width: 14,
                                    marginTop: -5,          // canh giữa track 3px
                                    backgroundColor: "#fff",
                                },
                                {
                                    borderColor: "#1d4ed8",
                                    height: 14,
                                    width: 14,
                                    marginTop: -5,
                                    backgroundColor: "#fff",
                                },
                            ]}
                            // giảm khoảng kéo sát mép container để gọn hơn
                            style={{ padding: "4px 2px" }}
                        />
                    </div>
                </div>

                {/* ==== COLOR FILTER ==== */}
                <FilterType
                    label="Màu sắc"
                    options={colorOptions}
                    selectedValues={selectedColors}
                    onToggle={onToggleColor}
                />

                {/* ==== SIZE FILTER ==== */}
                <FilterType
                    label="Kích cỡ"
                    options={sizeOptions}
                    selectedValues={selectedSizes}
                    onToggle={onToggleSize}
                />
            </div>
        </aside>
    );
}
