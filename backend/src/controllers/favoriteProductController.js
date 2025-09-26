// controllers/favoriteProductController.js
import favoriteService from '../services/favoriteProductService.js';
class FavoriteProductController {
  async add(req, res) {
    try {
      const userId = req.user?.sub;
      const { productId } = req.body;
      if (!productId) return res.status(400).json({ error: 'productId is required' });

      const favorite = await favoriteService.addFavorite(userId, productId);
      return res.json({ success: true, favorite });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  async remove(req, res) {
    try {
      const userId = req.user?.sub;
      const { productId } = req.body;
      if (!productId) return res.status(400).json({ error: 'productId is required' });

      await favoriteService.removeFavorite(userId, productId);
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  async list(req, res) {
    try {
      const userId = req.user?.sub;
      const favorites = await favoriteService.getUserFavorites(userId);
      return res.json({ success: true, favorites });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  async check(req, res) {
    try {
      const userId = req.user?.sub;
      const { productId } = req.query;
      if (!productId) return res.status(400).json({ error: 'productId is required' });

      const isFav = await favoriteService.isFavorite(userId, productId);
      return res.json({ success: true, isFavorite: isFav });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
}

export default new FavoriteProductController();