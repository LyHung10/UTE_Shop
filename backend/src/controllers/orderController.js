import OrderService from '../services/orderService';

class OrderController {
    static async addToCart(req, res) {
        try {
            const userId = req.user.sub; // Giả sử middleware auth gắn user vào req
            const { productId, qty, color, size } = req.body;
            const order = await OrderService.addToCart(userId, productId, qty, color, size);
            res.json(order);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    static async getCart(req, res) {
        try {
            const userId = req.user.sub;
            const cart = await OrderService.getCart(userId);
            res.json(cart);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    static async updateQuantity(req, res) {
        try {
            const userId = req.user.sub;
            const { itemId, qty } = req.body;
            const cart = await OrderService.updateQuantity(userId, itemId, qty);
            res.json({ success: true, message: 'Cart updated', ...cart });
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


    // xem số item in cart
    static async getCartCount(req, res, next) {
        try {
            const userId = req.user.sub;
            const count = await OrderService.getCartCount(userId);
            return res.json({ count });
        } catch (err) {
            next(err);
        }
    }

    static async checkoutCOD(req, res) {
        try {
            const userId = req.user.sub;
            const result = await OrderService.checkoutCOD(userId);
            res.status(201).json({
                success: true,
                message: "Checkout COD success",
                order: result.order,
                payment: result.payment
            });
        } catch (err) {
            console.error(err);
            res.status(400).json({ error: err.message });
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
}

export default OrderController;