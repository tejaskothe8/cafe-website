const express = require('express');
const { placeOrder, getMyOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/',            protect,             placeOrder);
router.get('/my',           protect,             getMyOrders);
router.get('/',             protect, adminOnly,  getAllOrders);
router.patch('/:id/status', protect, adminOnly,  updateOrderStatus);

module.exports = router;