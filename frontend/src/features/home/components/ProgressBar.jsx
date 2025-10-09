// components/ProgressBar.jsx
const ProgressBar = ({ sold, total, height = 2 }) => {
    const percentage = total > 0 ? (sold / total) * 100 : 0;
    
    return (
        <div className="w-full">
            <div 
                className="bg-gray-200 rounded-full overflow-hidden"
                style={{ height: `${height}px` }}
            >
                <div 
                    className="bg-red-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Đã bán: {sold}</span>
                <span>Còn: {total - sold}</span>
            </div>
        </div>
    );
};

export default ProgressBar;