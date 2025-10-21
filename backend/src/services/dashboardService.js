import { Op, Sequelize } from 'sequelize';
const { Order, Payment } = require('../models');

function safePctChange(current, previous) {
    if (!previous && !current) return 0;
    if (!previous && current) return 100;
    return Number((((current - previous) / previous) * 100).toFixed(2));
}

async function getDistinctPaidOrderIds(start, end) {
    const rows = await Payment.findAll({
        where: {
            status: { [Op.in]: ['PAID', 'paid'] },
            created_at: { [Op.between]: [start, end] }
        },
        attributes: [
            [Sequelize.fn('DISTINCT', Sequelize.col('order_id')), 'order_id']
        ],
        raw: true
    });

    return rows.map(r => r.order_id);
}

async function countDistinctCustomers(orderIds) {
    if (!orderIds.length) return 0;

    return Order.count({
        distinct: true,
        col: 'user_id',
        where: { id: orderIds }
    });
}

function getMonthStart(year, month) {
    // month: 1-12
    return new Date(year, month - 1, 1, 0, 0, 0, 0);
}
function getTodayStart() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

function startOfYear(year) {
    return new Date(year, 0, 1, 0, 0, 0, 0); // local time
}
function startOfNextYear(year) {
    return new Date(year + 1, 0, 1, 0, 0, 0, 0);
}

async function sumRevenueBetween(start, end) {
    const rows = await Payment.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('order.total_amount')), 'sum']
        ],
        include: [{ model: Order, as: 'order', attributes: [], required: true }],
        where: {
            status: { [Op.in]: ['PAID', 'paid'] },
            created_at: { [Op.between]: [start, end] }
        },
        raw: true
    });
    return Number(rows?.[0]?.sum || 0);
}

class DashboardService {
    static async getMetrics({ periodDays = 30 } = {}) {
        try {
            const now = new Date();

            // khoảng hiện tại
            const startCurrent = new Date(now);
            startCurrent.setDate(startCurrent.getDate() - periodDays);
            const endCurrent = now;

            // khoảng trước đó
            const startPrevious = new Date(now);
            startPrevious.setDate(startPrevious.getDate() - periodDays * 2);
            const endPrevious = new Date(now);
            endPrevious.setDate(endPrevious.getDate() - periodDays);

            // ——— ORDERS ———
            const paidOrderIdsCurrent = await getDistinctPaidOrderIds(startCurrent, endCurrent);
            const paidOrderIdsPrevious = await getDistinctPaidOrderIds(startPrevious, endPrevious);

            const ordersNow = paidOrderIdsCurrent.length;
            const ordersPrev = paidOrderIdsPrevious.length;

            // ——— CUSTOMERS (distinct buyer) ———
            const customersNow = await countDistinctCustomers(paidOrderIdsCurrent);
            const customersPrev = await countDistinctCustomers(paidOrderIdsPrevious);

            const periodLabel = `last_${periodDays}d_vs_prev_${periodDays}d`;

            return {
                success: true,
                message: 'Lấy dashboard metrics thành công',
                data: {
                    customers: {
                        value: customersNow,
                        pct_change: safePctChange(customersNow, customersPrev),
                        period: periodLabel,
                        range: {
                            current: { start: startCurrent, end: endCurrent },
                            previous: { start: startPrevious, end: endPrevious }
                        }
                    },
                    orders: {
                        value: ordersNow,
                        pct_change: safePctChange(ordersNow, ordersPrev),
                        period: periodLabel,
                        range: {
                            current: { start: startCurrent, end: endCurrent },
                            previous: { start: startPrevious, end: endPrevious }
                        }
                    }
                }
            };
        } catch (error) {
            console.error('[DashboardMetricsService.getMetrics] Error:', error);
            return {
                success: false,
                message: 'Đã xảy ra lỗi khi lấy dashboard metrics',
                error: error.message
            };
        }
    }

    static async getMonthlySales({ year }) {
        try {
            const y = Number(year) || new Date().getFullYear();
            const start = new Date(`${y}-01-01T00:00:00.000Z`);
            const end   = new Date(`${y}-12-31T23:59:59.999Z`);

            // Lấy số đơn đã thanh toán theo tháng
            const rows = await Payment.findAll({
                attributes: [
                    // MONTH() hoạt động tốt trên MySQL/MariaDB.
                    // Nếu bạn dùng Postgres, bạn có thể thay bằng Sequelize.literal(`DATE_PART('month', "created_at")`)
                    [Sequelize.fn('MONTH', Sequelize.col('created_at')), 'm'],
                    [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('order_id'))), 'orders']
                ],
                where: {
                    status: { [Op.in]: ['PAID', 'paid'] },
                    created_at: { [Op.between]: [start, end] }
                },
                group: ['m'],
                raw: true
            });

            // Map về 12 tháng, fill 0 nếu không có dữ liệu
            const data = Array(12).fill(0);
            rows.forEach(r => {
                const idx = (Number(r.m) || 0) - 1;
                if (idx >= 0 && idx < 12) data[idx] = Number(r.orders) || 0;
            });

            return {
                success: true,
                message: 'Lấy monthly sales thành công',
                data: {
                    year: y,
                    series: [{ name: 'Sales', data }],
                    categories: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                }
            };
        } catch (error) {
            console.error('[DashboardMonthlySalesService.getMonthlySales] Error:', error);
            return {
                success: false,
                message: 'Đã xảy ra lỗi khi lấy monthly sales',
                error: error.message
            };
        }
    }

    static async getMonthlyTarget({ year, month, targetAmount } = {}) {
        try {
            const now = new Date();
            const y = Number.isFinite(year) ? Number(year) : now.getFullYear();
            const m = Number.isFinite(month) ? Number(month) : (now.getMonth() + 1);

            const monthStart = getMonthStart(y, m);
            const nextMonthStart = getMonthStart(y, m + 1); // JS tự cuộn năm khi m=13
            const todayStart = getTodayStart();
            const monthTarget = Number(targetAmount ?? 2000000); // bạn có thể thay bằng bảng cấu hình targets

            // Doanh thu MTD (Month-To-Date): từ đầu tháng đến "bây giờ"
            const revenueMonthToDate = await sumRevenueBetween(monthStart, now);

            // Doanh thu Today: từ 00:00 hôm nay đến "bây giờ"
            const todayRevenue = await sumRevenueBetween(todayStart, now);

            // Tháng trước để tính % so với tháng trước (full tháng trước)
            const prevMonthStart = getMonthStart(y, m - 1);
            const prevMonthEnd = monthStart;
            const revenuePrevMonth = await sumRevenueBetween(prevMonthStart, prevMonthEnd);

            // % tiến độ so với target
            const progressPct = monthTarget > 0
                ? Number(((revenueMonthToDate / monthTarget) * 100).toFixed(2))
                : 0;

            // % so với tháng trước
            let pctVsLastMonth = 0;
            if (revenuePrevMonth === 0 && revenueMonthToDate > 0) pctVsLastMonth = 100;
            else if (revenuePrevMonth > 0) {
                pctVsLastMonth = Number(((revenueMonthToDate / revenuePrevMonth - 1) * 100).toFixed(2));
            }

            return {
                success: true,
                message: 'Lấy monthly target thành công',
                data: {
                    year: y,
                    month: m,
                    target_amount: monthTarget,
                    revenue_month_to_date: revenueMonthToDate,
                    today_revenue: todayRevenue,
                    progress_pct: progressPct,
                    pct_vs_last_month: pctVsLastMonth,
                    range: {
                        month: { start: monthStart, end: nextMonthStart },
                        today: { start: todayStart, end: now }
                    }
                }
            };
        } catch (error) {
            console.error('[DashboardMonthlyTargetService.getMonthlyTarget] Error:', error);
            return {
                success: false,
                message: 'Đã xảy ra lỗi khi lấy monthly target',
                error: error.message
            };
        }
    }

    static async getStatistics({ year } = {}) {
        try {
            const y = Number.isFinite(Number(year)) ? Number(year) : new Date().getFullYear();

            // Dùng [>= startOfYear, < startOfNextYear] để tránh lệch biên phải
            const from = startOfYear(y);
            const to   = startOfNextYear(y);

            // Lấy tất cả payment đã PAID trong năm, join Order để có total_amount
            // QUAN TRỌNG:
            // - Dùng attribute `createdAt` trong WHERE/ORDER (Sequelize map -> column `created_at`)
            // - Không dùng BETWEEN; dùng [gte, lt] ổn định hơn
            const payments = await Payment.findAll({
                where: {
                    status: { [Op.in]: ['PAID', 'paid'] },
                    createdAt: { [Op.gte]: from, [Op.lt]: to },
                },
                attributes: ['order_id', 'createdAt'],
                include: [
                    { model: Order, as: 'order', attributes: ['id', 'total_amount'] }
                ],
                order: [['createdAt', 'ASC']],
                // raw: false (mặc định) để có p.order
            });

            // 12 tháng
            const salesByMonth   = Array(12).fill(0);
            const revenueByMonth = Array(12).fill(0);

            // Tránh double-count: mỗi tháng chỉ tính 1 lần / order
            const monthOrderIdSets     = Array.from({ length: 12 }, () => new Set());
            const monthOrderAmountMaps = Array.from({ length: 12 }, () => new Map());

            for (const p of payments) {
                const orderId   = p.order_id;
                const createdAt = p.createdAt;              // <- attribute, không phải created_at
                if (!orderId || !createdAt) continue;

                const monthIndex = new Date(createdAt).getMonth(); // 0..11

                // Nếu order join không có (đề phòng), amount = 0
                const amount = Number(p.order?.total_amount ?? 0);

                // Distinct orders/tháng
                monthOrderIdSets[monthIndex].add(orderId);

                // Tính revenue/tháng theo order_id (mỗi order 1 lần)
                if (!monthOrderAmountMaps[monthIndex].has(orderId)) {
                    monthOrderAmountMaps[monthIndex].set(orderId, amount);
                }
            }

            // Tổng hợp
            for (let m = 0; m < 12; m++) {
                salesByMonth[m] = monthOrderIdSets[m].size;
                revenueByMonth[m] = Array.from(monthOrderAmountMaps[m].values())
                    .reduce((sum, v) => sum + Number(v || 0), 0);
            }

            return {
                success: true,
                message: 'Lấy statistics thành công',
                data: {
                    year: y,
                    categories: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
                    series: [
                        { name: 'Sales',   data: salesByMonth },
                        { name: 'Revenue', data: revenueByMonth },
                    ],
                },
            };
        } catch (error) {
            console.error('[DashboardStatisticsService.getStatistics] Error:', error);
            return {
                success: false,
                message: 'Đã xảy ra lỗi khi lấy statistics',
                error: error.message,
            };
        }
    }
}

export default DashboardService;
