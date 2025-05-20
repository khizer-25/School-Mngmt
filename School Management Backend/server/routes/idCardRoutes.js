const express = require('express');
const router = express.Router();
const { findStudent } = require('../controllers/IDCardController');

router.get('/find-student', findStudent);

module.exports = router;
