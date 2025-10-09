// controllers/flashSaleOrderController.js
const { FlashSale, FlashSaleProduct, FlashSaleOrder, Order, OrderItem, Inventory, Product, sequelize } = require('../models');
const { Op } = require('sequelize');

class FlashSaleOrderController {
  // Đặt hàng flash sale
  static async createFlashSaleOrder(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const userId = req.user.sub;
      const { flash_sale_id, flash_sale_product_id, quantity, color, size } = req.body;

      // Kiểm tra flash sale
      const flashSale = await FlashSale.findOne({
        where: {
          id: flash_sale_id,
          is_active: true,
          status: 'active'
        }
      }, { transaction });

      if (!flashSale) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Flash sale không tồn tại hoặc đã kết thúc'
        });
      }

      // Kiểm tra sản phẩm flash sale
      const flashSaleProduct = await FlashSaleProduct.findOne({
        where: {
          id: flash_sale_product_id,
          flash_sale_id,
          is_active: true
        },
        include: [
          {
            model: Product,
            as: 'product',
            include: [
              {
                model: Inventory,
                as: 'inventory'
              }
            ]
          }
        ],
        lock: transaction.LOCK.UPDATE,
        transaction
      });

      if (!flashSaleProduct) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Sản phẩm không tồn tại trong flash sale'
        });
      }

      // Kiểm tra số lượng
      if (quantity <= 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Số lượng không hợp lệ'
        });
      }

      if (quantity > flashSaleProduct.limit_per_user) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Vượt quá giới hạn mua (tối đa ${flashSaleProduct.limit_per_user} sản phẩm)`
        });
      }

      // Kiểm tra tồn kho flash sale
      const availableStock = flashSaleProduct.stock_flash_sale - flashSaleProduct.sold_flash_sale;
      if (quantity > availableStock) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Đã hết hàng flash sale. Chỉ còn ${availableStock} sản phẩm`
        });
      }

      // Kiểm tra tồn kho thực tế
      const productInventory = flashSaleProduct.product.inventory;
      const actualAvailableStock = productInventory.stock - productInventory.reserved;
      if (quantity > actualAvailableStock) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Sản phẩm đã hết hàng. Chỉ còn ${actualAvailableStock} sản phẩm trong kho`
        });
      }

      // Kiểm tra user đã mua bao nhiêu sản phẩm này trong flash sale
      const userPurchased = await FlashSaleOrder.sum('quantity', {
        where: {
          user_id: userId,
          flash_sale_id,
          flash_sale_product_id
        },
        transaction
      }) || 0;

      if (userPurchased + quantity > flashSaleProduct.limit_per_user) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Bạn đã mua ${userPurchased} sản phẩm. Không thể mua thêm vượt quá giới hạn ${flashSaleProduct.limit_per_user}`
        });
      }

      // Tạo order
      const order = await Order.create({
        user_id: userId,
        status: 'pending',
        total_amount: flashSaleProduct.flash_price * quantity,
        payment_method: 'COD',
        payment_status: 'PENDING'
      }, { transaction });

      // Tạo order item
      await OrderItem.create({
        order_id: order.id,
        product_id: flashSaleProduct.product_id,
        qty: quantity,
        price: flashSaleProduct.flash_price,
        color: color || null,
        size: size || null,
        status: 'pending'
      }, { transaction });

      // Tạo flash sale order record
      await FlashSaleOrder.create({
        flash_sale_id,
        flash_sale_product_id,
        user_id: userId,
        order_id: order.id,
        quantity,
        flash_price: flashSaleProduct.flash_price,
        total_amount: flashSaleProduct.flash_price * quantity
      }, { transaction });

      // Cập nhật số lượng đã bán
      await FlashSaleProduct.update(
        {
          sold_flash_sale: sequelize.literal(`sold_flash_sale + ${quantity}`)
        },
        {
          where: { id: flash_sale_product_id },
          transaction
        }
      );

      // Cập nhật inventory
      await Inventory.update(
        {
          reserved: sequelize.literal(`reserved + ${quantity}`)
        },
        {
          where: { product_id: flashSaleProduct.product_id },
          transaction
        }
      );

      await transaction.commit();

      return res.status(201).json({
        success: true,
        message: 'Đặt hàng flash sale thành công',
        data: {
          order_id: order.id,
          total_amount: flashSaleProduct.flash_price * quantity
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('[createFlashSaleOrder] error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }

  // Lấy lịch sử mua flash sale của user
  static async getUserFlashSaleOrders(req, res) {
    try {
      const userId = req.user.sub;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows: orders } = await FlashSaleOrder.findAndCountAll({
        where: { user_id: userId },
        include: [
          {
            model: FlashSale,
            attributes: ['id', 'name', 'start_time', 'end_time']
          },
          {
            model: FlashSaleProduct,
            attributes: ['id', 'flash_price', 'original_price'],
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name'],
                include: [
                  {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['url'],
                    limit: 1
                  }
                ]
              }
            ]
          },
          {
            model: Order,
            attributes: ['id', 'status', 'created_at']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return res.json({
        success: true,
        data: {
          orders,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(count / limit),
            total_items: count
          }
        }
      });
    } catch (error) {
      console.error('[getUserFlashSaleOrders] error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
}

module.exports = FlashSaleOrderController;