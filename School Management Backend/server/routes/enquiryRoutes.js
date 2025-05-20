const express = require('express');
const router = express.Router();
const { submitEnquiry, downloadEnquiryHistory,getAllEnquiries } = require('../controllers/enquiryController');

router.post('/', submitEnquiry);
router.get('/history', downloadEnquiryHistory);
router.get('/history/fetch',getAllEnquiries)


module.exports = router;
