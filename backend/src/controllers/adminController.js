// backend/src/controllers/userController.js
import { User } from '../models/index.js';
import { Op } from 'sequelize';

class AdminController {
  // Lấy danh sách users (cho admin)
  async getUsers(req, res) {
    try {
      const { search = '', page = 1, limit = 50, role } = req.query;
      const offset = (page - 1) * limit;
      // Điều kiện tìm kiếm
      const whereCondition = {};
      
      if (search) {
        whereCondition[Op.or] = [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone_number: { [Op.like]: `%${search}%` } }
        ];
      }

      if (role) {
        whereCondition.role_id = role;
      }

      const { count, rows } = await User.findAndCountAll({
        where: whereCondition,
        attributes: [
          'id', 
          'first_name', 
          'last_name', 
          'email', 
          'phone_number', 
          'gender', 
          'image', 
          'role_id',
          'position_id',
          'loyalty_points',
          'is_verified',
          'created_at',
          'updated_at'
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      res.json({
        success: true,
        data: {
          users: rows,
          total: count,
          page: parseInt(page),
          totalPages: Math.ceil(count / limit),
          hasMore: (offset + rows.length) < count
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.findByPk(id, {
        attributes: [
          'id', 
          'first_name', 
          'last_name', 
          'email', 
          'phone_number', 
          'gender', 
          'image', 
          'role_id',
          'position_id',
          'loyalty_points',
          'is_verified',
          'created_at'
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }


      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy thống kê users
  async getUserStats(req, res) {
    try {

      const totalUsers = await User.count();
      const verifiedUsers = await User.count({ where: { is_verified: true } });
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newUsersToday = await User.count({
        where: {
          created_at: {
            [Op.gte]: today
          }
        }
      });

      // Thống kê theo role
      const roleStats = await User.findAll({
        attributes: [
          'role_id',
          [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
        ],
        group: ['role_id'],
        raw: true
      });

      res.json({
        success: true,
        data: {
          total: totalUsers,
          verified: verifiedUsers,
          new_today: newUsersToday,
          role_stats: roleStats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Cập nhật user (admin)
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Loại bỏ các field không được phép update
      const allowedFields = [
        'first_name', 
        'last_name', 
        'phone_number', 
        'gender', 
        'image', 
        'role_id',
        'position_id',
        'loyalty_points',
        'is_verified'
      ];
      
      const filteredData = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });

      const [affectedCount] = await User.update(filteredData, {
        where: { id }
      });

      if (affectedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found or no changes made'
        });
      }

      // Lấy user đã update
      const updatedUser = await User.findByPk(id, {
        attributes: [
          'id', 
          'first_name', 
          'last_name', 
          'email', 
          'phone_number', 
          'gender', 
          'image', 
          'role_id',
          'position_id',
          'loyalty_points',
          'is_verified'
        ]
      });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new AdminController();