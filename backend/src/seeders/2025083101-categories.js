"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("categories", [
      {
        name: "Quà lưu niệm",
        slug: "qua-luu-niem",
        description: "Các sản phẩm quà tặng, lưu niệm mang thương hiệu UTE",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Văn phòng phẩm",
        slug: "van-phong-pham",
        description: "Bút, vở, giấy in, dụng cụ học tập và văn phòng",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Thời trang UTE",
        slug: "thoi-trang-ute",
        description: "Áo thun, đồng phục, balo, phụ kiện dành cho sinh viên UTE",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("categories", null, {});
  },
};
