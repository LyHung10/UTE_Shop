import { Category } from "../models/index.js";

class CategoryService {
    static async getCategories() {
        const categories = await Category.findAll({
            attributes: ['id', 'name', 'slug', 'description'],
            order: [['createdAt', 'DESC']],
        });

        return categories;
    }
}

export default CategoryService;
