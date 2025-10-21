import { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../../ui/badge/Badge";
import {getMetrics} from "@/services/adminService.jsx";

// helpers
const formatNumber = (n) =>
    new Intl.NumberFormat("en-US").format(Number(n || 0));
const formatPct = (p) =>
    `${Math.abs(Number(p || 0)).toFixed(2)}%`;

function TrendBadge({ pct }) {
  const up = Number(pct) >= 0;
  return (
      <Badge color={up ? "success" : "error"}>
        {up ? <ArrowUpIcon /> : <ArrowDownIcon />}
        {formatPct(pct)}
      </Badge>
  );
}

export default function EcommerceMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    getMetrics()
        .then((res) => {
          if (!mounted) return;
          // server trả: { success, message, data: { customers, orders } }
          setMetrics(res?.data || null);
        })
        .catch((e) => setErr(e?.message || "Failed to load metrics"))
        .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  // fallback values khi loading/lỗi
  const customersValue = metrics?.customers?.value ?? 0;
  const customersPct = metrics?.customers?.pct_change ?? 0;
  const ordersValue = metrics?.orders?.value ?? 0;
  const ordersPct = metrics?.orders?.pct_change ?? 0;

  return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        {/* Customers */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-800 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-700">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Customers
            </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {loading ? "…" : formatNumber(customersValue)}
              </h4>
            </div>
            {loading ? (
                <Badge color="neutral">…</Badge>
            ) : (
                <TrendBadge pct={customersPct} />
            )}
          </div>

          {/* lỗi hiển thị nhỏ (tuỳ chọn) */}
          {err && (
              <p className="mt-2 text-xs text-red-500">
                {err}
              </p>
          )}
        </div>

        {/* Orders */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-800 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-700">
            <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Orders
            </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {loading ? "…" : formatNumber(ordersValue)}
              </h4>
            </div>
            {loading ? (
                <Badge color="neutral">…</Badge>
            ) : (
                <TrendBadge pct={ordersPct} />
            )}
          </div>
        </div>
      </div>
  );
}
