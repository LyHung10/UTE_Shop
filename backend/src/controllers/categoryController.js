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
}
export default CategoryController;