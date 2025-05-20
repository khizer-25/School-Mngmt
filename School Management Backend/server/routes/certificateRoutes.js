// routes/certificateRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createBonafide, 
  getAllBonafides, 
  getBonafideById, 
  deleteBonafide,
  downloadBonafide,
  downloadAllBonafides
} = require('../controllers/certificateController');

// Routes
router.post('/', createBonafide);
router.get('/', getAllBonafides);
router.get('/download/all', downloadAllBonafides);
router.get('/download/:id', downloadBonafide);
router.get('/:id', getBonafideById);
router.delete('/:id', deleteBonafide);

module.exports = router;