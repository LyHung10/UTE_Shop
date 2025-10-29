// services/favoriteProductService.js
import { FavoriteProduct, Product, User, ProductImage, Review } from '../models/index.js';
import { fn, col } from 'sequelize';
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
    const favorites = await FavoriteProduct.findAll({
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

    // Lấy rating cho từng product
    const productIds = favorites.map(fav => fav.product.id);

    const ratings = await Review.findAll({
      attributes: [
        'product_id',
        [fn('AVG', col('rating')), 'avg_rating'],
        [fn('COUNT', col('id')), 'review_count']
      ],
      where: {
        product_id: productIds
      },
      group: ['product_id'],
      raw: true
    });

    // Map rating vào favorites
    const ratingMap = {};
    ratings.forEach(rating => {
      ratingMap[rating.product_id] = {
        avg_rating: parseFloat(rating.avg_rating) || 0,
        review_count: parseInt(rating.review_count) || 0
      };
    });

    return favorites.map(fav => {
      const productData = fav.toJSON();
      const productRating = ratingMap[fav.product.id] || { avg_rating: 0, review_count: 0 };

      return {
        ...productData,
        product: {
          ...productData.product,
          avg_rating: productRating.avg_rating,
          review_count: productRating.review_count
        }
      };
    });
  }


  async isFavorite(userId, productId) {
    const fav = await FavoriteProduct.findOne({ where: { user_id: userId, product_id: productId } });
    return !!fav;
  }
}

export default new FavoriteProductService();