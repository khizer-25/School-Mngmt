const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  admissionNo: { type: String, required: true },
  grade: { type: String, required: true },
  section: { type: String, required: true },
  rollNo: { type: String },
  studentName: { type: String, required: true },
  fatherName: { type: String, required: true },
  motherName: { type: String },
  gender: { type: String, required: true },
}, { timestamps: true });

// ✅ Prevent model overwrite error in development (nodemon/hot-reload)
const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

module.exports = Student;
