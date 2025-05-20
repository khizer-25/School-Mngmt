const EmailLog = require('../models/EmailLog');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:    process.env.EMAIL_HOST,
  port:    Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // optional, helps avoid SSL issues
  }
});

function buildMailOptions({ to, subject, html }) {
    return {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,  // Fixed string interpolation
      to,
      subject,
      html
    };
  }
  

async function logEmail({ recipients, subject, message, type }) {
  await EmailLog.create({ recipients, subject, message, type });
}
exports.sendSingleEmail = async (req, res) => {
    const { to, subject, message } = req.body;
    if (!to || !subject || !message) {
      return res.status(400).json({ success: false, error: 'to, subject and message are required' });
    }
    try {
      await transporter.sendMail(buildMailOptions({
        to,
        subject,
        html: `<p>${message}</p>`  // Corrected string interpolation
      }));
      await logEmail({ recipients: [to], subject, message, type: 'single' });
      res.json({ success: true, info: 'Email sent & logged (single)' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
  
  exports.sendGroupEmail = async (req, res) => {
    const { recipients, subject, message } = req.body;
    if (!Array.isArray(recipients) || !subject || !message) {
      return res.status(400).json({ success: false, error: 'recipients array, subject and message are required' });
    }
    try {
      await transporter.sendMail(buildMailOptions({
        to: recipients.join(','),
        subject,
        html: `<p>${message}</p>`  // Corrected string interpolation
      }));
      await logEmail({ recipients, subject, message, type: 'group' });
      res.json({ success: true, info: `Email sent & logged (group: ${recipients.length})` });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
  
  exports.sendDefaulterEmail = async (req, res) => {
    const { recipients, subject = 'Fee Defaulter Notice', message } = req.body;
    if (!Array.isArray(recipients) || !message) {
      return res.status(400).json({ success: false, error: 'recipients array and message are required' });
    }
    try {
      await transporter.sendMail(buildMailOptions({
        to: recipients.join(','),
        subject,
        html: `<p>${message}</p>`  // Corrected string interpolation
      }));
      await logEmail({ recipients, subject, message, type: 'defaulter' });
      res.json({ success: true, info: `Defaulter email sent & logged (${recipients.length})` });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
  
  exports.sendAbsentEmail = async (req, res) => {
    const { recipients, subject = 'Absent Notice', message } = req.body;
    if (!Array.isArray(recipients) || !message) {
      return res.status(400).json({ success: false, error: 'recipients array and message are required' });
    }
    try {
      await transporter.sendMail(buildMailOptions({
        to: recipients.join(','),
        subject,
        html: `<p>${message}</p>`  // Corrected string interpolation
      }));
      await logEmail({ recipients, subject, message, type: 'absent' });
      res.json({ success: true, info: `Absent email sent & logged (${recipients.length})` });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
  

// Add this at the bottom of the file:
exports.getEmailHistory = async (req, res) => {
  try {
    const logs = await EmailLog.find()
      .sort({ sentAt: -1 });          // newest first
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};