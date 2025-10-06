import { useState } from "react";

const FilterType = ({
                        label = "Color",                   // NEW: tiêu đề
                        options = ["White","Beige","Blue","Brown","Green","Purple"], // NEW: danh sách
                        selectedValues = [],              // NEW: mảng giá trị đã chọn (từ cha)
                        onToggle = () => {},              // NEW: callback toggle (từ cha)
                        defaultOpen = false,              // NEW: mở/đóng mặc định
                    }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="my-3 flow-root">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between bg-white pb-3 text-sm text-gray-400 hover:text-gray-500"
            >
                <span className="font-medium text-gray-900">{label}</span>
                <span className="ml-6 flex items-center">
          {!isOpen ? (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg>
          ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z" clipRule="evenodd" fillRule="evenodd" />
              </svg>
          )}
        </span>
            </button>

            {isOpen && (
                <div className="block">
                    <div className="space-y-4">
                        {options.map((opt, idx) => (
                            <div key={idx} className="flex gap-3">
                                <div className="flex h-5 shrink-0 items-center">
                                    <div className="group grid grid-cols-1 size-4">
                                        <input
                                            id={`filter-${label}-${idx}`}
                                            type="checkbox"
                                            name={`${label.toLowerCase()}[]`}
                                            value={opt.toLowerCase()}
                                            checked={selectedValues.includes(opt)}
                                            onChange={() => onToggle(opt)}
                                            className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                        />
                                        <svg viewBox="0 0 14 14" fill="none" className="pointer-events-none col-start-1 row-start-1 w-3.5 h-3.5 self-center justify-self-center stroke-white">
                                            <path d="M3 8L6 11L11 3.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                                  className={selectedValues.includes(opt) ? "opacity-100" : "opacity-0"} />
                                            <path d="M3 7H11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0" />
                                        </svg>
                                    </div>
                                </div>
                                <label htmlFor={`filter-${label}-${idx}`} className="text-sm text-gray-600">
                                    {opt}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterType;
