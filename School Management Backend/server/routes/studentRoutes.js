const express = require('express');
const router = express.Router();
const { getStudentsByClassAndSection } = require('../controllers/studentController');
const { searchStudent } = require('../controllers/studentController');
// GET: Get students by grade and section
router.get('/getstudents', getStudentsByClassAndSection);

// Search for student data
router.get('/search', searchStudent);
 
module.exports = router;
