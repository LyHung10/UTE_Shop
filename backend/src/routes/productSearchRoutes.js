// routes/searchRoutes.js
import express from 'express';
import productSearchController from '../controllers/productSearchController.js';
import elasticClient from '../config/elasticsearch.js';

const router = express.Router();

// 🧩 Tự tạo index nếu chưa có (tránh lỗi index_not_found_exception)
async function ensureProductIndex() {
  const { body: exists } = await elasticClient.indices.exists({ index: 'products' });
  if (!exists) {
    console.warn('⚠️ Index [products] chưa tồn tại, đang tạo mới...');
    await productSearchController.initElasticsearch();
    await productSearchController.syncProductsToElasticsearch();
  }
}

// @route GET /api/search/init
// @desc Khởi tạo Elasticsearch
router.get('/init', async (req, res) => {
  try {
    const success = await productSearchController.initElasticsearch();
    res.json({
      success,
      message: success ? '✅ Elasticsearch initialized successfully' : '⚠️ Using MySQL fallback',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Initialization failed',
      error: error.message,
    });
  }
});

// @route GET /api/search/suggestions
// @desc Gợi ý từ khóa tìm kiếm
router.get('/suggestions', async (req, res) => {
  try {
    await ensureProductIndex();
    await productSearchController.getSearchSuggestions(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/search
// @desc Tìm kiếm sản phẩm
router.get('/', async (req, res) => {
  try {
    await ensureProductIndex();
    await productSearchController.searchProducts(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message,
    });
  }
});

// @route GET /api/search/advanced
// @desc Tìm kiếm nâng cao (filter)
router.get('/advanced', async (req, res) => {
  try {
    await ensureProductIndex();
    await productSearchController.advancedSearch(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Advanced search failed',
      error: error.message,
    });
  }
});

// @route GET /api/search/health
// @desc Kiểm tra trạng thái Elasticsearch
router.get('/health', async (req, res) => {
  try {
    const { body: health } = await elasticClient.cluster.health();
    res.json({
      success: true,
      status: health.status,
      cluster_name: health.cluster_name,
      timed_out: health.timed_out,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Elasticsearch is not available',
      error: error.message,
    });
  }
});

// @route POST /api/search/sync
// @desc Đồng bộ lại dữ liệu từ MySQL sang Elasticsearch
router.post('/sync', async (req, res) => {
  try {
    await ensureProductIndex();
    await productSearchController.syncProductsToElasticsearch();
    res.json({
      success: true,
      message: '✅ Data synced successfully to Elasticsearch',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Sync failed',
      error: error.message,
    });
  }
});

// @route GET /api/search/stats
// @desc Lấy thống kê dữ liệu
router.get('/stats', async (req, res) => {
  try {
    await ensureProductIndex();

    const { body: stats } = await elasticClient.indices.stats({ index: 'products' });
    const { body: count } = await elasticClient.count({ index: 'products' });

    res.json({
      success: true,
      data: {
        document_count: count.count,
        index_size: stats?._all?.primaries?.store?.size_in_bytes ?? 0,
        total_size: stats?._all?.total?.store?.size_in_bytes ?? 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not get search stats',
      error: error.message,
    });
  }
});

export default router;
