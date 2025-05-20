const express = require('express');
const {getAllStudents, registerStudent, checkAdmissionNumber } = require('../controllers/NewRegistrationController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { findStudent } = require('../controllers/IDCardController');
const router = express.Router();


// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure "uploads" folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Ensure unique filenames for uploaded files
  }
});
// Ensure "uploads" directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ storage: storage });


// Route for registering a student (with file uploads)
router.post(
  '/register',
  upload.fields([
    { name: 'studentPhoto', maxCount: 1 },
    { name: 'birthCertificate', maxCount: 1 },
    { name: 'previousMarksheet', maxCount: 1 },
    { name: 'transferCertificate', maxCount: 1 }
  ]),
  registerStudent
);
 router.get('/findStudents', findStudent);
 router.get('/getstudents', getAllStudents);
 router.get('/check-admission-number', checkAdmissionNumber);
module.exports = router;
