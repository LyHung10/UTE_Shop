// src/utils/format.js
export const formatPrice = (v) =>
    Number(v || 0).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND"
    });

export const formatDateTime = (iso) =>
    iso
        ? new Date(iso).toLocaleString("vi-VN", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        })
        : "—";

export class normalizeStatus {
}