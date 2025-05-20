const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  recipients: { type: [String], required: true },
  subject:    { type: String,   required: true },
  message:    { type: String,   required: true },
  type:       { 
    type: String, 
    enum: ['single','group','defaulter','absent'], 
    required: true 
  },
  sentAt:     { type: Date,     default: Date.now }
});

module.exports = mongoose.model('EmailLog', emailLogSchema);