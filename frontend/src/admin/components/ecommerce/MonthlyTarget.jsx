import Chart from "react-apexcharts";
import { useState, useEffect } from "react";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import {getMonthlyTarget} from "@/services/adminService.jsx";

export default function MonthlyTarget() {
  const [series, setSeries] = useState([0]);
  const [target, setTarget] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [pctVsLastMonth, setPctVsLastMonth] = useState(0);
  const [loading, setLoading] = useState(true);

  // Gọi API khi component mount
  useEffect(() => {
    getMonthlyTarget()
        .then((res) => {
          const data = res?.data;
          if (data) {
            setSeries([Number(data.progress_pct || 0)]);
            setTarget(Number(data.target_amount || 0));
            setRevenue(Number(data.revenue_month_to_date || 0));
            setTodayRevenue(Number(data.today_revenue || 0));
            setPctVsLastMonth(Number(data.pct_vs_last_month || 0));
          }
        })
        .catch((err) => console.error("Failed to fetch monthly target:", err))
        .finally(() => setLoading(false));
  }, []);

  const options = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "80%" },
        track: { background: "#E4E7EC", strokeWidth: "100%", margin: 5 },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return `${Number(val).toFixed(0)}%`;
            },
          },
        },
      },
    },
    fill: { type: "solid", colors: ["#465FFF"] },
    stroke: { lineCap: "round" },
    labels: ["Progress"],
  };

  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const formatCurrency = (val) =>
      `${(val).toFixed(0)} VNĐ`; // ví dụ: 20000 -> $20K

  const isUp = pctVsLastMonth >= 0;
  const percentText = `${isUp ? "+" : ""}${pctVsLastMonth.toFixed(1)}%`;

  return (
      <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
        <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Monthly Target
              </h3>
              <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                Target you’ve set for each month
              </p>
            </div>
            <div className="relative inline-block">
              <button className="dropdown-toggle" onClick={toggleDropdown}>
                <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
              </button>
              <Dropdown
                  isOpen={isOpen}
                  onClose={closeDropdown}
                  className="w-40 p-2"
              >
                <DropdownItem
                    onItemClick={closeDropdown}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  View More
                </DropdownItem>
                <DropdownItem
                    onItemClick={closeDropdown}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  Delete
                </DropdownItem>
              </Dropdown>
            </div>
          </div>

          <div className="relative">
            <div className="max-h-[330px]" id="chartDarkStyle">
              <Chart options={options} series={series} type="radialBar" height={330} />
            </div>

            {!loading && (
                <span
                    className={`absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full px-3 py-1 text-xs font-medium ${
                        isUp
                            ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
                            : "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
                    }`}
                >
              {percentText}
            </span>
            )}
          </div>

          <p className="mx-auto mt-10 w/full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
            You earn {formatCurrency(todayRevenue)} today,{" "}
            {isUp
                ? "it's higher than last month. Keep up your good work!"
                : "it's lower than last month. Let's push harder!"}
          </p>
        </div>

        <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
          {/* Target */}
          <div>
            <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
              Target
            </p>
            <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
              {formatCurrency(target)}
            </p>
          </div>

          <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

          {/* Revenue */}
          <div>
            <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
              Revenue
            </p>
            <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
              {formatCurrency(revenue)}
            </p>
          </div>

          <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

          {/* Today */}
          <div>
            <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
              Today
            </p>
            <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
              {formatCurrency(todayRevenue)}
            </p>
          </div>
        </div>
      </div>
  );
}
