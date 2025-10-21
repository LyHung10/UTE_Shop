import DashboardMetricsService from '../services/dashboardService.js';
import DashboardMonthlySalesService from "../services/dashboardService.js";

export async function getMetrics(req, res) {
    const days = Number(req.query.days) || 30;
    const result = await DashboardMetricsService.getMetrics({ periodDays: days });
    if (!result.success) return res.status(500).json(result);
    return res.json(result);
}

export async function monthlySales(req, res) {
    const year = Number(req.query.year) || new Date().getFullYear();
    const result = await DashboardMonthlySalesService.getMonthlySales({ year });
    if (!result.success) return res.status(500).json(result);
    return res.json(result);
}

export async function monthlyTarget(req, res) {
    const year = Number(req.query.year) || undefined;
    const month = Number(req.query.month) || undefined; // 1..12; nếu không truyền sẽ lấy tháng hiện tại
    const targetAmount = req.query.target ? Number(req.query.target) : undefined; // cho phép FE override target
    const result = await DashboardMonthlySalesService.getMonthlyTarget({ year, month, targetAmount });
    if (!result.success) return res.status(500).json(result);
    return res.json(result);
}

export async function statistics(req, res) {
    const year = Number(req.query.year) || new Date().getFullYear();
    const result = await DashboardMonthlySalesService.getStatistics({ year });
    if (!result.success) return res.status(500).json(result);
    return res.json(result);
}