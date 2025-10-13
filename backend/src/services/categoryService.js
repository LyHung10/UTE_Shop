import { Category } from "../models/index.js";
import { Op } from "sequelize";

class CategoryService {
    // ✅ Lấy tất cả danh mục
    static async getCategories() {
        const categories = await Category.findAll({
            attributes: ["id", "name", "slug", "description"],
            order: [["createdAt", "DESC"]],
        });
        return categories;
    }

    // ✅ Lấy chi tiết 1 danh mục theo id
    static async getCategoryById(id) {
        const category = await Category.findByPk(id, {
            attributes: ["id", "name", "slug", "description"],
        });
        return category;
    }

    // ✅ Thêm mới danh mục
    static async createCategory(data) {
        const { name, slug, description } = data;

        // Kiểm tra trùng slug
        const existing = await Category.findOne({ where: { slug } });
        if (existing) {
            return { success: false, message: "Slug đã tồn tại!" };
        }

        const newCategory = await Category.create({
            name,
            slug,
            description,
        });

        return {
            success: true,
            message: "Thêm danh mục thành công",
            data: newCategory,
        };
    }

    // ✅ Cập nhật danh mục
    static async updateCategory(id, data) {
        const category = await Category.findByPk(id);
        if (!category) {
            return { success: false, message: "Không tìm thấy danh mục!" };
        }

        await category.update({
            name: data.name ?? category.name,
            slug: data.slug ?? category.slug,
            description: data.description ?? category.description,
        });

        return {
            success: true,
            message: "Cập nhật danh mục thành công",
            data: category,
        };
    }

    // ✅ Xóa danh mục
    static async deleteCategory(id) {
        const category = await Category.findByPk(id);
        if (!category) {
            return { success: false, message: "Không tìm thấy danh mục!" };
        }

        await category.destroy();

        return {
            success: true,
            message: `Đã xóa danh mục "${category.name}" thành công.`,
        };
    }
}

export default CategoryService;
