// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { processPayment } = require('../controllers/feesController');
const { getFeeDefaulters } = require('../controllers/feesController');
const {getDefaultersByClassAndSection } = require('../controllers/feesController');
const { getPaymentsByAdmissionNumber } = require('../controllers/feesController');
const { getAllDefaulters } = require('../controllers/feesController');
router.post('/payment', processPayment);

router.get('/defaulters', getFeeDefaulters);
// Get students with balance > 0
router.get('/students-with-balance', getDefaultersByClassAndSection);
router.get('/', getPaymentsByAdmissionNumber);
router.get('/all-defaulters', getAllDefaulters);

module.exports = router;
