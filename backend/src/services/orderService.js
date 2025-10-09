import { sequelize } from "../config/configdb";

const { Order, OrderItem, Product, ProductImage, Inventory, Payment,
    User, Voucher, Address, FlashSale, FlashSaleProduct } = require('../models');
import paymentService from './paymentService.js';
import voucherService from "./voucherService";
import { implodeEntry } from "nodemailer-express-handlebars/.yarn/releases/yarn-1.22.22";
const { Op } = require('sequelize');
class OrderService {
    static async getUserOrders(userId, options = {}) {
        const {
            status,
            from,
            to,
            page = 1,
            pageSize = 10,
            sort = '-created_at'
        } = options;

        const where = { user_id: userId };
        if (status) where.status = status;

        if (from || to) {
            where.created_at = {};
            if (from) where.created_at[Op.gte] = new Date(from);
            if (to) where.created_at[Op.lte] = new Date(to);
        }

        const orderBy =
            sort === 'created_at'
                ? [['created_at', 'ASC']]
                : [['created_at', 'DESC']];

        const { rows, count } = await Order.findAndCountAll({
            where,
            order: orderBy,
            limit: pageSize,
            offset: (page - 1) * pageSize,
            distinct: true,
            include: [
                {
                    model: OrderItem,
                    attributes: ['id', 'qty', 'price', 'product_id', 'color', 'size', 'status'],
                    include: [
                        {
                            model: Product,
                            attributes: ['id', 'name', 'price', 'original_price', 'discount_percent'],
                            include: [
                                {
                                    model: ProductImage,
                                    as: 'images',
                                    attributes: ['url'],
                                    separate: true,
                                    limit: 1
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Address,
                    as: 'address',
                    attributes: ['address_line', 'ward', 'district', 'city', 'postal_code', 'name_order', 'phone_order']
                }
                // ❌ Không join Voucher để khỏi dính lỗi cột `code` không tồn tại
            ]
        });

        // Tính discount cho từng order dựa trên voucher_id (nếu có)
        const data = await Promise.all(rows.map(async (o) => {
            const items = Array.isArray(o?.OrderItems) ? o.OrderItems : [];

            const mappedItems = items.map((it) => {
                const prod = it.Product;
                const firstImage = prod && Array.isArray(prod.images) && prod.images.length > 0
                    ? prod.images[0].url
                    : null;

                return {
                    id: it.id,
                    qty: Number(it.qty) || 0,
                    price: Number(it.price) || 0,
                    color: it.color,
                    size: it.size,
                    status: it.status,
                    product: prod ? {
                        id: prod.id,
                        name: prod.name,
                        price: Number(prod.price) || 0,
                        original_price: prod.original_price != null ? Number(prod.original_price) : null,
                        discount_percent: prod.discount_percent != null ? Number(prod.discount_percent) : null,
                        image: firstImage
                    } : null
                };
            });

            const subtotal = mappedItems.reduce((sum, i) => sum + (i.price * i.qty), 0);

            // Nếu DB đã có total_amount thì ưu tiên dùng; nếu không thì dùng subtotal
            const totalAmount = o.total_amount != null
                ? Number(o.total_amount) || 0
                : Number(subtotal.toFixed(2));

            // 👉 TÍNH DISCOUNT: nếu có voucher_id thì validate dựa trên slug (hoặc code nếu có cột đó)
            let discount = 0;
            if (o.voucher_id) {
                const v = await Voucher.findByPk(o.voucher_id);
                if (v) {
                    const voucherCodeOrSlug = v.slug; // dùng slug an toàn
                    const result = await voucherService.validateVoucher(voucherCodeOrSlug, subtotal);
                    if (result?.valid) {
                        discount = Number(result.discount || 0);
                    }
                }
            }

            const addr = o.address
                ? {
                    text: [
                        o.address.address_line,
                        o.address.ward,
                        o.address.district,
                        o.address.city,
                        o.address.postal_code
                    ].filter(Boolean).join(', '),
                    detail: {
                        address_line: o.address.address_line,
                        ward: o.address.ward,
                        district: o.address.district,
                        city: o.address.city,
                        postal_code: o.address.postal_code,
                        name_order: o.address.name_order,
                        phone_order: o.address.phone_order
                    }
                }
                : null;

            return {
                order: {
                    id: o.id,
                    status: o.status,
                    created_at: o.created_at || o.createdAt,
                    updated_at: o.updated_at || o.updatedAt,
                    total_amount: totalAmount
                },
                address: addr,
                discount,       // 🆕 số tiền giảm (0 nếu không có voucher)
                items: mappedItems
            };
        }));

        return {
            success: true,
            message: "Lấy danh sách đơn hàng thành công",
            pagination: {
                page,
                page_size: pageSize,
                total: count
            },
            data
        };
    }

    static async getDetailOrder(userId, orderId) {
        try {
            // === Tìm đơn hàng thuộc user ===
            const order = await Order.findOne({
                where: { id: orderId, user_id: userId },
                include: [
                    {
                        model: OrderItem,
                        include: [
                            {
                                model: Product,
                                attributes: ["id", "name", "price", "original_price", "discount_percent"],
                                include: [
                                    {
                                        model: ProductImage,
                                        as: "images",
                                        attributes: ["url"],
                                        separate: true,
                                        limit: 1
                                    }
                                ]
                            }
                        ]
                    },
                    { model: Payment },
                    { model: Address, as: "address" } // lấy địa chỉ giao hàng
                ]
            });

            if (!order) {
                return { success: false, message: "Không tìm thấy đơn hàng này." };
            }

            // === Tính tổng phụ (subtotal) ===
            const items = Array.isArray(order.OrderItems) ? order.OrderItems : [];
            const subtotal = items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);

            // === Tính discount nếu có voucher ===
            let discount = 0;
            if (order.voucher_id) {
                const v = await Voucher.findByPk(order.voucher_id);
                if (v) {
                    const result = await voucherService.validateVoucher(v.slug, subtotal);
                    if (result?.valid) discount = Number(result.discount || 0);
                }
            }

            // === Format danh sách sản phẩm ===
            const mappedItems = items.map((it) => {
                const prod = it.Product;
                const firstImage = prod && Array.isArray(prod.images) && prod.images.length > 0
                    ? prod.images[0].url
                    : null;

                return {
                    id: it.id,
                    qty: Number(it.qty) || 0,
                    price: Number(it.price) || 0,
                    color: it.color,
                    size: it.size,
                    status: it.status,
                    product: prod ? {
                        id: prod.id,
                        name: prod.name,
                        price: Number(prod.price) || 0,
                        original_price: prod.original_price != null ? Number(prod.original_price) : null,
                        discount_percent: prod.discount_percent != null ? Number(prod.discount_percent) : null,
                        image: firstImage
                    } : null
                };
            });

            // === Gộp địa chỉ giao hàng ===
            const addr = order.address
                ? {
                    text: [
                        order.address.address_line,
                        order.address.ward,
                        order.address.district,
                        order.address.city,
                        order.address.postal_code
                    ].filter(Boolean).join(', '),
                    detail: {
                        address_line: order.address.address_line,
                        ward: order.address.ward,
                        district: order.address.district,
                        city: order.address.city,
                        postal_code: order.address.postal_code,
                        name_order: order.address.name_order,
                        phone_order: order.address.phone_order
                    }
                }
                : null;

            // === Format dữ liệu trả về ===
            const totalAmount = Number(order.total_amount ?? subtotal - discount);

            const data = {
                order: {
                    id: order.id,
                    status: order.status,
                    created_at: order.created_at || order.createdAt,
                    updated_at: order.updated_at || order.updatedAt,
                    total_amount: totalAmount,
                    discount,
                    voucher_id: order.voucher_id ?? null,
                    payment_method: order.Payment?.method || null,
                    payment_status: order.Payment?.status || null
                },
                address: addr,
                items: mappedItems
            };

            return {
                success: true,
                message: "Lấy chi tiết đơn hàng thành công",
                data
            };
        } catch (err) {
            console.error("[getDetailOrder] error:", err);
            return {
                success: false,
                message: "Đã xảy ra lỗi khi lấy chi tiết đơn hàng",
                error: err.message
            };
        }
    }

    static async addToCart(userId, productId, qty, color, size) {
        if (qty <= 0) return { success: false, message: 'Số lượng không hợp lệ' };
        if (qty > 10) return { success: false, message: 'Số lượng không vượt quá 10' };

        const product = await Product.findByPk(productId);
        if (!product) return { success: false, message: 'Sản phẩm không tồn tại' };

        const inventory = await Inventory.findOne({ where: { product_id: productId } });
        if (!inventory) {
            return { success: false, message: 'Sản phẩm này hiện chưa có trong kho' };
        }
        if (inventory.stock <= 0) {
            return { success: false, message: 'Sản phẩm đã hết hàng' };
        }
        if (qty > inventory.stock - inventory.reserved) {
            return { success: false, message: `Chỉ còn ${inventory.stock - inventory.reserved} sản phẩm trong kho` };
        }

        if (size && product.sizes && !product.sizes.includes(size)) {
            return { success: false, message: `Kích thước không hợp lệ. Kích thước hợp lệ: ${product.sizes.join(', ')}` };
        }

        if (color && product.colors && product.colors.length > 0) {
            const colorNames = typeof product.colors[0] === 'object'
                ? product.colors.map(c => c.name)
                : product.colors;
            if (!colorNames.some(c => c.toLowerCase() === color.toLowerCase())) {
                return { success: false, message: `Màu không hợp lệ. Màu hợp lệ: ${colorNames.join(', ')}` };
            }
        }

        // Tìm order pending
        let order = await Order.findOne({ where: { user_id: userId, status: 'pending' } });
        if (!order) {
            order = await Order.create({ user_id: userId, status: 'pending', total_amount: 0 });
        }

        const whereCondition = {
            order_id: order.id,
            product_id: productId,
            color: color || null,
            size: size || null
        };

        let item = await OrderItem.findOne({ where: whereCondition });

        if (item) {
            const newQty = item.qty + qty;

            // ✅ Kiểm tra tổng số lượng không vượt quá tồn kho
            if (newQty > inventory.stock - inventory.reserved) {
                return { success: false, message: `Chỉ còn ${inventory.stock - inventory.reserved} sản phẩm trong kho` };
            }

            if (newQty > 10) {
                return { success: false, message: 'Số lượng không vượt quá 10' };
            }

            item.qty = newQty;
            await item.save();
        } else {
            if (qty > inventory.stock - inventory.reserved) {
                return { success: false, message: `Chỉ còn ${inventory.stock - inventory.reserved} sản phẩm trong kho` };
            }

            item = await OrderItem.create({
                order_id: order.id,
                product_id: product.id,
                qty,
                price: product.price,
                color: color || null,
                size: size || null
            });
        }

        // Lấy lại thông tin product kèm ảnh
        const productWithImage = await Product.findByPk(item.product_id, {
            attributes: ['id', 'name', 'price', 'original_price', 'discount_percent', 'colors', 'sizes'],
            include: [
                {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['url'],
                    limit: 1
                }
            ]
        });

        return {
            success: true,
            message: 'Thêm sản phẩm thành công',
            data: {
                id: item.id,
                order_id: item.order_id,
                product_id: item.product_id,
                qty: item.qty,
                price: item.price,
                color: item.color,
                size: item.size,
                status: item.status,
                product: {
                    id: productWithImage.id,
                    name: productWithImage.name,
                    price: productWithImage.price,
                    original_price: productWithImage.original_price,
                    discount_percent: productWithImage.discount_percent,
                    image: productWithImage.images.length > 0 ? productWithImage.images[0].url : null
                }
            }
        };
    }

    static async getCart(userId, voucherCode = null) {
        const order = await Order.findOne({
            where: { user_id: userId, status: 'pending' },
            include: [{
                model: OrderItem,
                include: {
                    model: Product,
                    attributes: ['id', 'name', 'price', 'original_price', 'discount_percent'],
                    include: [
                        { model: ProductImage, as: 'images', attributes: ['url'], limit: 1 }
                    ]
                }
            }]
        });

        if (!order) return { items: [], total: 0 };

        const items = order.OrderItems;
        let total = items.reduce((sum, i) => sum + parseFloat(i.price) * i.qty, 0);

        let discount = 0;
        let appliedVoucher = null;

        if (voucherCode) {
            const result = await voucherService.validateVoucher(voucherCode, total);
            if (result.valid) {
                discount = result.discount;
                appliedVoucher = result.voucher.slug;
            }
        }

        const finalTotal = Math.max(total - discount, 0);

        return {
            items,
            total,
            itemCount: items.length,
            discount,
            finalTotal,
            appliedVoucher
        };
    }


    static async updateQuantity(userId, itemId, qty) {
        if (!itemId || qty < 1) return {
            success: false,
            message: 'Số lượng không hợp lệ'
        };

        if (qty > 10) return {
            success: false,
            message: 'Số lượng không vượt quá 10'
        };

        const orderItem = await OrderItem.findOne({
            where: { id: itemId },
            include: [
                { model: Order, where: { user_id: userId, status: 'pending' } }
            ]
        });

        if (!orderItem) return {
            success: false,
            message: 'Sản phẩm không tồn tại'
        };

        orderItem.qty = qty;
        await orderItem.save();

        return {
            success: true,
            message: 'Cập nhật sản phẩm thành công'
        };
    }


    static async removeItem(userId, itemId) {
        const orderItem = await OrderItem.findOne({
            where: { id: itemId },
            include: [{ model: Order, where: { user_id: userId, status: 'pending' } }]
        });
        if (!orderItem) throw new Error('Cart item not found');

        const orderId = orderItem.Order.id;
        await orderItem.destroy();

        const remainingItems = await OrderItem.findAll({ where: { order_id: orderId } });
        const order = await Order.findByPk(orderId);

        order.total_amount = remainingItems.length
            ? remainingItems.reduce((sum, item) => sum + parseFloat(item.price) * item.qty, 0)
            : 0;

        await orderItem.save(); // hoặc destroy
        return await OrderService.getCart(userId);

    }

    static async clearCart(userId) {
        const order = await Order.findOne({ where: { user_id: userId, status: 'pending' } });
        if (!order) return { items: [], totalAmount: 0 };

        await OrderItem.destroy({ where: { order_id: order.id } });
        order.total_amount = 0;
        await order.save();

        return { items: [], totalAmount: 0 };
    }

    static async getCartByUser(userId) {
        const order = await Order.findOne({
            where: { user_id: userId, status: 'pending' },
            include: [{ model: OrderItem, include: Product }]
        });

        if (!order) return { items: [], totalAmount: 0 };

        return {
            items: order.OrderItems,
            totalAmount: order.OrderItems.reduce((sum, i) => sum + parseFloat(i.price) * i.qty, 0)
        };
    }

    static async getCartByOrderId(orderId) {
        const cartItems = await OrderItem.findAll({
            where: { order_id: orderId },
            include: [
                { model: Product, attributes: ['id', 'name', 'price', 'image', 'colors', 'sizes'] }
            ],
            order: [['created_at', 'DESC']]
        });

        const totalAmount = cartItems.reduce((sum, i) => sum + parseFloat(i.price) * i.qty, 0);

        return { items: cartItems, totalAmount };
    }

    static async checkoutCOD(userId, voucherCode, addressId, shippingFee) {
        const tax = 40000;
        const fee = Number(shippingFee ?? 0);
        console.log(shippingFee);
        return await Order.sequelize.transaction(async (t) => {
            const order = await Order.findOne({
                where: { user_id: userId, status: 'pending' },
                include: [{ model: OrderItem, include: [Product] }],
                transaction: t,
                lock: t.LOCK.UPDATE
            });
            if (!order || order.OrderItems.length === 0) return {
                success: false,
                message: "Giỏ hàng trống",
            }
            if (!addressId) return {
                success: false,
                message: "Vui lòng chọn địa chỉ để thanh toán!",
            }
            const address = await Address.findOne({
                where: { id: addressId, user_id: userId },
                transaction: t,
                lock: t.LOCK.UPDATE
            });
            if (!address) return {
                success: false,
                message: "Địa chỉ không tồn tại!",
            }
            else {
                order.address_id = addressId;
            }

            for (const item of order.OrderItems) {
                const inv = await Inventory.findOne({
                    where: { product_id: item.product_id },
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });

                if (!inv) return {
                    success: false,
                    message: "Không tìm thấy sản phẩm trong kho!",
                }
                const available = (inv.stock || 0) - (inv.reserved || 0);
                if (item.qty > available) return {
                    success: false,
                    message: `Một số sản phẩm trong giỏ đã hết hàng`
                }

                inv.reserved += item.qty;
                await inv.save({ transaction: t });
            }

            const total = order.OrderItems.reduce(
                (sum, i) => sum + parseFloat(i.price) * i.qty,
                0
            );

            let discount = 0;
            let appliedVoucher = null;

            if (voucherCode) {
                const result = await voucherService.validateVoucher(voucherCode, total, { transaction: t });
                if (!result.valid) return {
                    success: false,
                    message: result.message,
                }
                appliedVoucher = result.voucher;

                discount = result.discount;
                appliedVoucher.usage_limit -= 1;
                appliedVoucher.used_count += 1;
                await appliedVoucher.save({ transaction: t });
            }

            order.status = "new";
            order.total_amount = total - discount + tax + fee;

            if (appliedVoucher) {
                order.voucher_id = appliedVoucher.id;
            }
            await order.save({ transaction: t });

            // === 🔎 Kiểm tra xem Payment đã tồn tại chưa ===
            let payment = await Payment.findOne({
                where: { order_id: order.id },
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (payment) {
                // ✅ Nếu đã có, chỉ cập nhật lại (không tạo mới)
                payment.method = "COD";
                payment.status = "pending";
                payment.amount = order.total_amount;
                await payment.save({ transaction: t });
            } else {
                // ✅ Nếu chưa có, tạo mới
                payment = await Payment.create({
                    order_id: order.id,
                    method: "COD",
                    status: "pending", // chờ shipper thu tiền
                    amount: order.total_amount
                }, { transaction: t });
            }

            return {
                success: true,
                message: "Checkout COD thành công",
                data:
                {
                    order,
                    payment,
                }
            };
        });
    }

    static async confirmCODPayment(orderId) {
        return await Order.sequelize.transaction(async (t) => {
            const payment = await Payment.findOne({
                where: { order_id: orderId },
                transaction: t
            });
            if (!payment) throw new Error("Payment not found");

            payment.status = "paid";
            await payment.save({ transaction: t });

            const order = await Order.findOne({
                where: { id: orderId },
                include: [{ model: OrderItem, include: [Product] }],
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!order) throw new Error("Order not found");

            if (["completed", "canceled"].includes(order.status)) {
                throw new Error(`Order already finalized with status ${order.status}`);
            }

            // Lấy thời gian hiện tại để kiểm tra flash sale
            const currentTime = new Date();

            for (const item of order.OrderItems) {
                const inv = await Inventory.findOne({
                    where: { product_id: item.product_id },
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });
                const product = await Product.findByPk(item.product_id, {
                    transaction: t, lock: t.LOCK.UPDATE
                });
                if (!product) {
                    throw new Error(`Product ${item.product_id} not found`);
                }
                product.sale_count = product.sale_count + item.qty;

                if (!inv) {
                    throw new Error(`Inventory for product ${item.product_id} not found`);
                }

                const need = Number(item.qty) || 0;
                const reserved = Number(inv.reserved) || 0;
                const stock = Number(inv.stock) || 0;

                inv.stock = stock - need;
                inv.reserved = reserved - need;

                await inv.save({ transaction: t });
                await product.save({ transaction: t });

                // KIỂM TRA VÀ CẬP NHẬT FLASH SALE
                const flashSaleProduct = await FlashSaleProduct.findOne({
                    where: {
                        product_id: item.product_id
                    },
                    include: [{
                        model: FlashSale,
                        as: 'flash_sale',
                        where: {
                            start_time: { [Op.lte]: currentTime },
                            end_time: { [Op.gte]: currentTime },
                            is_active: true
                        }
                    }],
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });

                if (flashSaleProduct) {
                    // Cập nhật số lượng đã bán trong flash sale
                    flashSaleProduct.sold_flash_sale = (flashSaleProduct.sold_flash_sale || 0) + need;

                    // Kiểm tra không vượt quá stock flash sale
                    if (flashSaleProduct.sold_flash_sale > flashSaleProduct.stock_flash_sale) {
                        throw new Error(`Số lượng bán vượt quá stock flash sale cho sản phẩm ${item.product_id}`);
                    }

                    await flashSaleProduct.save({ transaction: t });

                    console.log(`Updated flash sale sold count for product ${item.product_id}: +${need} (total: ${flashSaleProduct.sold_flash_sale})`);
                }
            }

            const user = await User.findByPk(order.user_id, { transaction: t, lock: t.LOCK.UPDATE });
            if (user) {
                const pointsEarned = Math.floor(order.total_amount / 100);  // mỗi 100k là được 1k
                user.loyalty_points = (user.loyalty_points || 0) + pointsEarned;
                console.log(`User ${order.user_id} earned ${pointsEarned} loyalty points, total now ${user.loyalty_points}`);
                await user.save({ transaction: t });
            }

            if (order.status === "shipping") {
                order.status = "completed";
            } else {
                return {
                    success: false,
                    message: `Đơn hàng có trạng thái ${order.status} không cho phép xác nhận`
                }
            }

            await order.save({ transaction: t });

            return {
                success: true,
                message: "Đơn hàng COD đã thành công",
                data: {
                    order,
                    payment,
                }
            };
        });
    }

    static async checkoutVNPay(userId) {
        return await Order.sequelize.transaction(async (t) => {
            const order = await Order.findOne({
                where: { user_id: userId, status: 'PENDING' },
                include: [{ model: OrderItem, include: [Product] }],
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!order || order.OrderItems.length === 0) {
                throw new Error("Cart is empty");
            }

            // Tính tổng tiền
            const totalAmount = order.OrderItems.reduce((sum, item) => {
                return sum + (parseFloat(item.price) * parseInt(item.qty));
            }, 0);

            const roundedAmount = Math.round(totalAmount) / 100;

            order.status = "COMPLETED";
            order.total_amount = roundedAmount;
            await order.save({ transaction: t });

            //Payment cũng cho là đã PAID
            const payment = await Payment.create({
                order_id: order.id,
                method: "VNPay",
                status: "PAID",
                amount: roundedAmount
            }, { transaction: t });

            console.log("Creating VNPay payment (mock) for order:", {
                orderId: order.id,
                amount: roundedAmount,
                itemCount: order.OrderItems.length
            });

            // Cộng điểm tích lũy cho user
            const user = await User.findByPk(userId, { transaction: t, lock: t.LOCK.UPDATE });
            if (user) {
                const pointsEarned = Math.floor(roundedAmount / 100);  // mỗi 100k là được 1k
                user.loyalty_points = (user.loyalty_points || 0) + pointsEarned;
                await user.save({ transaction: t });
            }
            // Vẫn build URL cho đẹp, nhưng thực tế order đã COMPLETED
            const paymentUrl = await paymentService.createPayment({
                id: order.id,
                amount: roundedAmount,
                description: `Thanh toán đơn hàng UteShop #${order.id}`,
                ip: "127.0.0.1"
            });

            return { order, payment, paymentUrl };
        });
    }


    // Updated VNPay confirmation method
    static async confirmVNPayPayment(orderId, query) {
        return await Order.sequelize.transaction(async (t) => {

            try {
                const result = await paymentService.verifyPayment(query);

                if (!result || result.responseCode !== '00') {
                    console.error("VNPay payment verification failed:", result);
                    throw new Error(`Payment failed: ${result?.responseCode || 'Unknown error'}`);
                }

                const payment = await Payment.findOne({
                    where: { order_id: orderId },
                    transaction: t
                });
                if (!payment) throw new Error("Payment not found");

                const order = await Order.findByPk(orderId, {
                    include: [OrderItem],
                    transaction: t
                });
                if (!order) throw new Error("Order not found");

                // Verify the amount matches (convert from VND cents back to VND)
                const queryAmount = parseInt(query.vnp_Amount) / 100;
                const orderAmount = parseFloat(payment.amount);

                if (Math.abs(queryAmount - orderAmount) > 0.01) {
                    throw new Error(`Amount mismatch: expected ${orderAmount}, got ${queryAmount}`);
                }

                // Only deduct stock when payment is CONFIRMED
                for (const item of order.OrderItems) {
                    const inv = await Inventory.findOne({
                        where: { product_id: item.product_id },
                        transaction: t,
                        lock: t.LOCK.UPDATE
                    });
                    if (!inv || inv.stock < item.qty) {
                        throw new Error(`Product ${item.product_id} out of stock`);
                    }
                    inv.stock -= item.qty;
                    await inv.save({ transaction: t });
                }

                payment.status = "PAID";
                await payment.save({ transaction: t });

                order.status = "COMPLETED";
                await order.save({ transaction: t });

                return { order, payment };

            } catch (error) {
                throw error;
            }
        });
    }

    static async getAllOrders() {
        const orders = await Order.findAll({
            include: [
                {
                    model: User,
                    attributes: ['first_name', 'last_name']
                },
                {
                    model: Address,
                    as: 'address',
                    attributes: ['address_line', 'ward', 'district', 'city', 'postal_code']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        return orders.map(o => {
            const userName = `${o.User?.first_name || ''} ${o.User?.last_name || ''}`.trim();

            const addr = o.address
                ? [
                    o.address.address_line,
                    o.address.ward,
                    o.address.district,
                    o.address.city,
                    o.address.postal_code
                ].filter(Boolean).join(', ')
                : null;

            return {
                orderId: o.id,
                userName,
                totalAmount: Number(o.total_amount || 0),
                address: addr,
                status: o.status
            };
        });
    }

    static async updateOrderPackingStatus(orderId) {
        const order = await Order.findByPk(orderId);
        if (!order) {
            throw new Error(`Order with id ${orderId} not found`);
        }
        if (order.status === "new") {
            order.status = "packing"
            await order.save();
        }
        else {
            return {
                success: false,
                message: "Đơn đã được xác nhận trước đó!"
            }
        }

        return {
            success: true,
            message: `Xác nhận đơn hàng ${order.id} thành công!`
        }
    }

    static async updateOrderShippingStatus(orderId) {
        const order = await Order.findByPk(orderId);
        if (!order) {
            throw new Error(`Order with id ${orderId} not found`);
        }
        if (order.status === "packing") {
            order.status = "shipping"
            await order.save();
        }
        else {
            return {
                success: false,
                message: "Đơn hàng hàng đã được giao trước đó"
            }
        }

        return {
            success: true,
            message: `Đang vận chuyển đơn hàng ${order.id}!`
        }
    }
}
export default OrderService;