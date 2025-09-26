// services/favoriteProductService.js
import { FavoriteProduct, Product, User, ProductImage } from '../models/index.js';
class FavoriteProductService {
  async addFavorite(userId, productId) {
    const existing = await FavoriteProduct.findOne({ where: { user_id: userId, product_id: productId } });
    if (existing) return existing;
    return FavoriteProduct.create({ user_id: userId, product_id: productId });
  }

  async removeFavorite(userId, productId) {
    return FavoriteProduct.destroy({ where: { user_id: userId, product_id: productId } });
  }

  async getUserFavorites(userId) {
    return FavoriteProduct.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: "product",
          include: [
            {
              model: ProductImage,
              as: "images",
              attributes: ["id", "url"] 
            }
          ]
        }
      ]
    });
  }


  async isFavorite(userId, productId) {
    const fav = await FavoriteProduct.findOne({ where: { user_id: userId, product_id: productId } });
    return !!fav;
  }
}

export default new FavoriteProductService();