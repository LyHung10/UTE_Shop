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
            // Middleware auth đã gắn user vào req
            const userId = req.user?.sub;
            const orderId = req.params.orderId;

            const order = await OrderService.getDetailOrder(userId, orderId);
            const data = {
                id: order.id,
                status: order.status,
                created_at: order.createdAt,
                updated_at: order.updatedAt,
                total_amount: Number(order.total_amount ?? 0),

                // Nếu bảng Order có các field dưới thì trả ra (tùy schema của bạn)
                receiver_name: order.receiver_name || null,
                receiver_phone: order.receiver_phone || null,
                shipping_address: order.shipping_address || null,
                shipping_fee: Number(order.shipping_fee ?? 0),
                discount: Number(order.discount ?? 0),
                voucher_discount: Number(order.voucher_discount ?? 0),
                payment_method: order.Payment.method || null,

                items: (order.OrderItems || order.items || []).map((it) => ({
                    qty: it.qty,
                    price: Number(it.price),
                    color: it.color,
                    size: it.size,
                    product: it.Product
                        ? {
                            name: it.Product.name,
                            price: Number(it.Product.price),
                            original_price: Number(it.Product.original_price),
                            discount_percent: it.Product.discount_percent,
                            image:
                                (it.Product.images && it.Product.images[0]?.url) || null,
                        }
                        : null,
                })),
            };

            res.json({data});
        } catch (err) {
            // Log server-side để debug
            console.error('[getDetailOrder] error:', err);
            res.status(400).json({ error: err.message || 'Bad request' });
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
            const { voucherCode, addressId } = req.body;
            const result = await OrderService.checkoutCOD(userId, voucherCode, addressId);

            return res.status(201).json({
                success: true,
                message: "Checkout COD thành công.",
                order: result.order,
            });
        } catch (err) {
            console.error("Checkout COD error:", err);
            return res.status(400).json({
                success: false,
                error: err.message || "Checkout thất bại."
            });
        }
    }

    static async confirmCODPayment(req, res) {
        try {
            const { orderId } = req.params;
            const result = await OrderService.confirmCODPayment(orderId);
            res.json({
                success: true,
                message: "COD payment confirmed",
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
            const result = await OrderService.checkoutVNPay(userId);

            res.status(201).json({
                success: true,
                message: "Checkout VNPay success",
                order: result.order,
                payment: result.payment,
                paymentUrl: result.paymentUrl
            });
        } catch (err) {
            console.error(err);
            res.status(400).json({ error: err.message });
        }
    }

    static async confirmVNPay(req, res) {
        try {
            const { orderId } = req.params;
            const result = await OrderService.confirmVNPayPayment(orderId, req.query);

            res.json({
                success: true,
                message: "VNPay payment confirmed",
                order: result.order,
                payment: result.payment
            });
        } catch (err) {
            console.error(err);
            res.status(400).json({ error: err.message });
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
            const updatedOrder = await OrderService.updateOrderStatus(id);

            return res.status(200).json({
                message: `Xác nhận đơn hàng ${updatedOrder.orderId} thành công`,
            });
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }
    }
}

export default OrderController;