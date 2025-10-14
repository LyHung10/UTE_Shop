import CategoryService from '../services/categoryService';

class CategoryController {
    static async getCategories(req, res) {
        try {
            const categories = await CategoryService.getCategories();
            res.json(categories);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    // ✅ Thêm mới
    static async createCategory(req, res) {
        try {
            const result = await CategoryService.createCategory(req.body);
            if (!result.success) {
                return res.status(400).json(result);
            }
            return res.status(201).json(result);
        } catch (err) {
            console.error("create error:", err);
            return res.status(500).json({ success: false, message: "Lỗi server!" });
        }
    }

    // ✅ Cập nhật
    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const result = await CategoryService.updateCategory(id, req.body);
            if (!result.success) {
                return res.status(404).json(result);
            }
            return res.json(result);
        } catch (err) {
            console.error("update error:", err);
            return res.status(500).json({ success: false, message: "Lỗi server!" });
        }
    }

    // ✅ Xóa
    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            const result = await CategoryService.deleteCategory(id);
            if (!result.success) {
                return res.status(404).json(result);
            }
            return res.json(result);
        } catch (err) {
            console.error("delete error:", err);
            return res.status(500).json({ success: false, message: "Lỗi server!" });
        }
    }
}
export default CategoryController;