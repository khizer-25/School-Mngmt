const mongoose = require('mongoose');

const bonafideSchema = new mongoose.Schema({
    studentFullName: {
        type: String,
        required: true,
    },
    admissionNumber: {
        type: String,
        required: true,
    },
    className: {
        type: String,
        required: true,
    },
    section: {
        type: String,
        required: true,
    },
    academicYear: {
        type: String,
        required: true,
    },
    issueDate: {
        type: Date,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Certificate', bonafideSchema);
