import express from 'express';
import productSearchController from '../controllers/productSearchController.js';

const router = express.Router();


router.get('/init', async (req, res) => {
  try {
    const success = await productSearchController.initElasticsearch();
    res.json({ 
      success, 
      message: success ? 'Elasticsearch initialized successfully' : 'Using MySQL fallback' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Initialization failed',
      error: error.message 
    });
  }
});


router.get('/suggestions', productSearchController.getSearchSuggestions);


router.get('/', productSearchController.searchProducts);



// @route   GET /api/search/health
// @desc    Kiểm tra trạng thái Elasticsearch
// @access  Public
router.get('/health', async (req, res) => {
  try {
    const elasticClient = (await import('../config/elasticsearch.js')).default;
    const health = await elasticClient.cluster.health();
    res.json({
      success: true,
      status: health.status,
      cluster_name: health.cluster_name,
      timed_out: health.timed_out
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Elasticsearch is not available',
      error: error.message
    });
  }
});

// @route   POST /api/search/sync
// @desc    Đồng bộ lại dữ liệu từ MySQL sang Elasticsearch
// @access  Public
router.post('/sync', async (req, res) => {
  try {
    await productSearchController.syncProductsToElasticsearch();
    res.json({
      success: true,
      message: 'Data synced successfully to Elasticsearch'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sync failed',
      error: error.message
    });
  }
});

// @route   GET /api/search/stats
// @desc    Lấy thống kê về dữ liệu search
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const elasticClient = (await import('../config/elasticsearch.js')).default;
    
    const stats = await elasticClient.indices.stats({
      index: 'products'
    });
    
    const count = await elasticClient.count({
      index: 'products'
    });
    
    res.json({
      success: true,
      data: {
        document_count: count.count,
        index_size: stats._all.primaries.store.size_in_bytes,
        total_size: stats._all.total.store.size_in_bytes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not get search stats',
      error: error.message
    });
  }
});

export default router;