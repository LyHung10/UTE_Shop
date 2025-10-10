import FilterType from "@/features/product/components/FilterType.jsx";

export default function Filter({
                                   selectedColors = [],
                                   onToggleColor = () => {},
                                   selectedSizes = [],
                                   onToggleSize = () => {},
                               }) {
    return (
        <aside className="hidden lg:block bg-white sticky top-24 self-start">
            {/* Header của filter: không cuộn */}
            <div className="px-3 py-3 border-b"><b>Bộ lọc tìm kiếm</b></div>

            {/* Vùng nội dung: CHỈ MỘT scroll container */}
            {/* 6rem ở dưới nên khớp với top-24 (96px) + chiều cao header filter (3.5rem ≈ 56px) */}
            <div
                className="max-h-[calc(100vh-6rem-3.5rem)] overflow-y-auto px-3 py-2
                   [&::-webkit-scrollbar]:w-[4px]
                   [&::-webkit-scrollbar-thumb]:bg-gray-400
                   [&::-webkit-scrollbar-thumb]:rounded
                   [&::-webkit-scrollbar-track]:bg-transparent"
            >
                <FilterType
                    label="Color"
                    options={["White","Beige","Blue","Brown","Green","Purple"]}
                    selectedValues={selectedColors}
                    onToggle={onToggleColor}
                />

                <FilterType
                    label="Size"
                    options={["XS","S","M","L","XL","2XL"]}
                    selectedValues={selectedSizes}
                    onToggle={onToggleSize}
                />
            </div>
        </aside>
    );
}
