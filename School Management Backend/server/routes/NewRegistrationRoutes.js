const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const {
  getAllStudents,
  registerStudent,
  checkAdmissionNumber
} = require('../controllers/NewRegistrationController');
const { findStudent } = require('../controllers/IDCardController');

const router = express.Router();

// =======================
// Cloudinary Configuration
// =======================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// =======================
// Multer-Cloudinary Setup
// =======================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'student_uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    public_id: (req, file) => `${file.fieldname}-${Date.now()}`
  },
});

const upload = multer({ storage });

// =======================
// Routes
// =======================

router.post(
  '/register',
  upload.fields([
    { name: 'studentPhoto', maxCount: 1 },
    { name: 'birthCertificate', maxCount: 1 },
    { name: 'previousMarksheet', maxCount: 1 },
    { name: 'transferCertificate', maxCount: 1 },
  ]),
  registerStudent
);

router.get('/findStudents', findStudent);
router.get('/getstudents', getAllStudents);
router.get('/check-admission-number', checkAdmissionNumber);

module.exports = router;
