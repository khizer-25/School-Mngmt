// models/StudentRegistration.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  dateOfBirth: Date,
  gender: String,
  bloodGroup: String,
  grade: String,
  section: String,
  academicYear: String,
   admissionNumber: {
    type: String,
    required: true,
    unique: true, // Enforce uniqueness at DB level
    match: /^\d{5}$/
  },
  rollNumber: String,
  totalFees: Number,
  parentName: String,
  relationship: String,
  phoneNumber: String,
  emailAddress: String,
  address: String,
  studentPhoto: String,
  birthCertificate: String,
  previousMarksheet: String,
  transferCertificate: String,
}, { timestamps: true });

module.exports = mongoose.model('StudentRegistration', studentSchema);
