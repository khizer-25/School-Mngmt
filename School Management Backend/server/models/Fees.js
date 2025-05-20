// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
  },
  admissionNumber: {
    type: String,
    required: true,
  },
  feeType: {
    type: String,
    required: true,
  },
  paymentDate: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  remarks: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payment', paymentSchema);
