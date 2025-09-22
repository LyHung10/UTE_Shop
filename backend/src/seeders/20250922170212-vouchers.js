'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const vouchersToSeed = [
      {
        name: 'Giảm 10% cho đơn hàng đầu tiên',
        slug: 'FIRST10',
        description: 'Áp dụng cho khách hàng mới, giảm 10% tối đa 50.000đ',
        discount_type: 'percent',
        discount_value: 10,
        max_discount: 50000,
        min_order_value: 0,
        usage_limit: 100,
        used_count: 0,
        start_date: now,
        end_date: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()), // 1 tháng
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        name: 'Giảm 50k cho đơn từ 500k',
        slug: 'SAVE50K',
        description: 'Đơn hàng từ 500.000đ được giảm 50.000đ',
        discount_type: 'fixed',
        discount_value: 50000,
        max_discount: null,
        min_order_value: 500000,
        usage_limit: 200,
        used_count: 0,
        start_date: now,
        end_date: new Date(now.getFullYear(), now.getMonth() + 2, now.getDate()), // 2 tháng
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        name: 'Black Friday 30%',
        slug: 'BLACKFRI30',
        description: 'Ưu đãi Black Friday, giảm 30% tối đa 300k',
        discount_type: 'percent',
        discount_value: 30,
        max_discount: 300000,
        min_order_value: 0,
        usage_limit: 500,
        used_count: 0,
        start_date: now,
        end_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7), // 7 ngày
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        name: 'Voucher đã hết hạn',
        slug: 'OLD100',
        description: 'Voucher test, đã hết hạn',
        discount_type: 'fixed',
        discount_value: 100000,
        max_discount: null,
        min_order_value: 1000000,
        usage_limit: 50,
        used_count: 10,
        start_date: new Date(now.getFullYear(), now.getMonth() - 2, now.getDate()),
        end_date: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
        status: 'expired',
        created_at: now,
        updated_at: now
      },
      {
        name: 'Tết Nguyên Đán 20%',
        slug: 'TET20',
        description: 'Ưu đãi mừng xuân, giảm 20% tối đa 200k',
        discount_type: 'percent',
        discount_value: 20,
        max_discount: 200000,
        min_order_value: 300000,
        usage_limit: 300,
        used_count: 0,
        start_date: new Date(now.getFullYear(), 0, 15), // 15/01
        end_date: new Date(now.getFullYear(), 1, 15),   // 15/02
        status: 'active',
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('vouchers', vouchersToSeed);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('vouchers', null, {});
  }
};
