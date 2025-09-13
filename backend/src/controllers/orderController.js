import OrderService from '../services/orderService';
class OrderController {
    static async addToCart(req, res) {
        try {
            const userId = req.user.sub; // Giả sử middleware auth gắn user vào req
            const { productId, qty } = req.body;
            const order = await OrderService.addToCart(userId, productId, qty);
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

    static async removeItem(req, res) {
        try {
            const userId = req.user.sub;
            const { productId } = req.params;
            const order = await OrderService.removeItem(userId, productId);
            res.json(order);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}

export default OrderController;