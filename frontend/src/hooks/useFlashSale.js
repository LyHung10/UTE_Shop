// hooks/useFlashSale.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { getCurrentFlashSales } from '@/services/flashSaleService';

export const useFlashSale = () => {
    const [flashSales, setFlashSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef(null);

    // Sử dụng useCallback để tránh re-render không cần thiết
    const fetchFlashSales = useCallback(async () => {
        try {
            console.log('🔄 Fetching flash sales...');
            const res = await getCurrentFlashSales();
            if (res.success) {
                setFlashSales(res.data || []);
            }
        } catch (error) {
            console.error('Error fetching flash sales:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Hàm kiểm tra có flash sale nào cần theo dõi không
    const hasActiveOrUpcomingFlashSales = useCallback((flashSales) => {
        return flashSales.some(fs => {
            const status = fs.calculatedStatus || fs.status;
            return status === 'active' || status === 'upcoming';
        });
    }, []);

    useEffect(() => {
        fetchFlashSales();

        // Xóa interval cũ nếu có
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Set up interval mới - fetch mỗi 30 giây
        intervalRef.current = setInterval(() => {
            fetchFlashSales();
        }, 30000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchFlashSales]);

    // Hàm refresh manual
    const refreshFlashSales = useCallback(() => {
        fetchFlashSales();
    }, [fetchFlashSales]);

    // Hàm kiểm tra product có trong flash sale không
    const getProductFlashSaleInfo = useCallback((productId) => {
        for (const flashSale of flashSales) {
            const flashProduct = flashSale.flash_sale_products?.find(
                fp => fp.product_id === productId && fp.is_active
            );
            if (flashProduct) {
                const status = flashSale.calculatedStatus || flashSale.status;
                
                return {
                    flashSale,
                    flashProduct,
                    isActive: status === 'active',
                    isUpcoming: status === 'upcoming',
                    isEnded: status === 'ended',
                    status
                };
            }
        }
        return null;
    }, [flashSales]);

    // Lấy active flash sales
    const activeFlashSales = flashSales.filter(fs => 
        (fs.calculatedStatus || fs.status) === 'active'
    );
    const upcomingFlashSales = flashSales.filter(fs => 
        (fs.calculatedStatus || fs.status) === 'upcoming'
    );

    return {
        flashSales,
        activeFlashSales,
        upcomingFlashSales,
        loading,
        getProductFlashSaleInfo,
        refreshFlashSales
    };
};