import OrderService from '../services/orderService';

class OrderController {
    static async getUserOrders(req, res) {
        try {
            // Middleware auth đã gắn user vào req
            const userId = req.user?.sub;
            // Query params: ?status=&from=&to=&page=&page_size=&sort=
            const {
                status,
                from,
                to,
                page,
                page_size,
                sort // 'created_at' | '-created_at' (default trong service là '-created_at')
            } = req.query;
            // Ép kiểu số hợp lệ cho page & page_size (nếu truyền)
            const pageNum = page !== undefined ? Math.max(1, Number(page)) : undefined;
            const pageSizeNum = page_size !== undefined ? Math.max(1, Number(page_size)) : undefined;

            const result = await OrderService.getUserOrders(userId, {
                status,
                from,
                to,
                page: pageNum,
                pageSize: pageSizeNum,
                sort
            });
            res.json(result);
        } catch (err) {
            // Log server-side để debug
            console.error('[getUserOrders] error:', err);
            res.status(400).json({ error: err.message || 'Bad request' });
        }
    }

    static async getDetailOrder(req, res) {
        try {
            const userId = req.user?.sub;            // middleware auth
            const orderId = req.params.orderId;

            const result = await OrderService.getDetailOrder(userId, orderId);

            // Không tìm thấy hoặc service báo fail
            if (!result || result.success === false || !result.data) {
                return res.status(404).json({
                    success: false,
                    message: result?.message || "Không tìm thấy đơn hàng này."
                });
            }

            // Trả đúng format từ service: { success, message, data: { order, address, items } }
            return res.json(result);
        } catch (err) {
            console.error('[getDetailOrder] error:', err);
            return res.status(400).json({
                success: false,
                error: err.message || 'Bad request'
            });
        }
    }

    static async getAdminDetailOrder(req, res) {
        try {
            const orderId = req.params.orderId;
            const result = await OrderService.getDetailOrder(null, orderId);

            // Không tìm thấy hoặc service báo fail
            if (!result || result.success === false || !result.data) {
                return res.status(404).json({
                    success: false,
                    message: result?.message || "Không tìm thấy đơn hàng này."
                });
            }

            // Trả đúng format từ service: { success, message, data: { order, address, items } }
            return res.json(result);
        } catch (err) {
            console.error('[getDetailOrder] error:', err);
            return res.status(400).json({
                success: false,
                error: err.message || 'Bad request'
            });
        }
    }

    static async addToCart(req, res) {
        try {
            const userId = req.user.sub; // middleware auth
            const { productId, qty, color, size } = req.body;

            const result = await OrderService.addToCart(userId, productId, qty, color, size);

            res.status(200).json(result);
        } catch (err) {
            res.status(400).json({
                success: false,
                error: err.message
            });
        }
    }

    static async getCart(req, res) {
        try {
            const userId = req.user.sub;
            const { voucherCode } = req.query; // lấy từ query param
            const cart = await OrderService.getCart(userId, voucherCode);
            res.json(cart);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    static async updateQuantity(req, res) {
        try {
            const userId = req.user.sub;
            const { itemId, qty } = req.body;
            const result = await OrderService.updateQuantity(userId, itemId, qty);
            res.status(200).json(result);
        } catch (err) {
            console.error(err);
            res.status(400).json({ error: 'Failed to update cart', message: err.message });
        }
    }

    static async removeItem(req, res) {
        try {
            const userId = req.user.sub;
            const { itemId } = req.params;
            const cart = await OrderService.removeItem(userId, itemId);
            res.json({ success: true, message: 'Item removed', ...cart });
        } catch (err) {
            console.error(err);
            res.status(400).json({ error: 'Failed to remove item', message: err.message });
        }
    }

    static async clearCart(req, res) {
        try {
            const userId = req.user.sub;
            const cart = await OrderService.clearCart(userId);
            res.json({ success: true, message: 'Cart cleared', ...cart });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to clear cart', message: err.message });
        }
    }

    static async checkoutCOD(req, res) {
        try {
            const userId = req.user.sub;
            const { voucherCode, addressId, shippingFee} = req.body;
            const result = await OrderService.checkoutCOD(userId, voucherCode, addressId, shippingFee);
            res.status(201).json(result);
        } catch (err) {
            return res.status(400).json({
                error: err.message || "Checkout thất bại."
            });
        }
    }

    static async confirmOrderCompleted(req, res) {
        try {
            const { orderId } = req.params;
            const result = await OrderService.confirmOrderCompleted(orderId);
            res.json({
                success: true,
                message: "Xác nhận thanh toán COD, giao hàng thành công",
                order: result.order,
                payment: result.payment
            });
        } catch (err) {
            console.error(err);
            res.status(400).json({ error: err.message });
        }
    }
    ////////////////////
    static async checkoutVNPay(req, res) {
        try {
            const userId = req.user.sub;
            const { voucherCode, addressId, shippingFee} = req.body;
            const result = await OrderService.checkoutVNPay(userId, voucherCode, addressId, shippingFee);
            res.status(201).json(result);
        } catch (err) {
            return res.status(400).json({
                error: err.message || "Checkout Vnpay thất bại."
            });
        }
    }

    static async getAllOrders(req, res) {
        try {
            const data = await OrderService.getAllOrders();
            return res.status(200).json({
                data
            });
        } catch (err) {
            console.error('getAllOrders error:', err);
            return res.status(500).json({ message: err.message || 'Internal Server Error' });
        }
    }

    static async confirmOrder(req, res) {
        try {
            const { id } = req.body;
            const result = await OrderService.updateOrderPackingStatus(id);
            res.status(201).json(result);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }
    }

    static async confirmShippingOrder(req, res) {
        try {
            const { id } = req.body;
            const result = await OrderService.updateOrderShippingStatus(id);
            res.status(201).json(result);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }
    }

    static async cancelOrder(req, res) {
        try {
            const userId = req.user?.sub;
            const {orderId} = req.body;
            const result = await OrderService.cancelOrder(userId, orderId);
            if (!result) {
                return res.status(500).json({success: false, message: 'Unexpected error'});
            }


            return res.status(200).json(result);
        } catch (err) {
            console.error('[cancelOrder] error:', err);
            return res.status(500).json({
                success: false,
                message: err.message || 'Internal Server Error',
            });
        }
    }

    static async cancelAdminOrder(req, res) {
        try {
            const {orderId} = req.body;
            const result = await OrderService.cancelAdminOrder(orderId);
            if (!result) {
                return res.status(500).json({success: false, message: 'Unexpected error'});
            }

            if (result.success === false) {
                const msg = (result.message || '').toLowerCase();
                const notFound = msg.includes('không tìm thấy');
                return res.status(notFound ? 404 : 400).json(result);
            }

            return res.status(200).json(result);
        } catch (err) {
            console.error('[cancelOrder] error:', err);
            return res.status(500).json({
                success: false,
                message: err.message || 'Internal Server Error',
            });
        }
    }
}

export default OrderController;