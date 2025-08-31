"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("categories", [
      {
        name: "Giáo trình & Sách học",
        slug: "giao-trinh-sach-hoc",
        description: "Các loại giáo trình, tài liệu, sách tham khảo dành cho sinh viên UTE",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Đồ dùng học tập",
        slug: "do-dung-hoc-tap",
        description: "Bút, vở, máy tính cầm tay, thước kẻ, dụng cụ vẽ kỹ thuật…",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Đồng phục & Phụ kiện",
        slug: "dong-phuc-phu-kien",
        description: "Áo UTE, balo, nón, huy hiệu và các phụ kiện sinh viên",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Đồ điện tử",
        slug: "do-dien-tu",
        description: "Tai nghe, chuột, bàn phím, USB, ổ cứng… hỗ trợ học tập",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Đồ ăn vặt & Nước uống",
        slug: "do-an-vat-nuoc-uong",
        description: "Snack, mì gói, cà phê, trà sữa, nước suối cho sinh viên bận rộn",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("categories", null, {});
  },
};
