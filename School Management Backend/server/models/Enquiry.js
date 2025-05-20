const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  parentName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true },
  classInterested: { type: String, required: true },
  communicationMode: { type: String, required: true },
  message: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);
