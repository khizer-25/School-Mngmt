const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/DashboardController');

router.get('/stats', getDashboardStats);

module.exports = router;
