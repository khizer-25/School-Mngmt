const EmailLog = require("../models/EmailLog");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // optional, helps avoid SSL issues
  },
});

function buildMailOptions({ to, subject, html }) {
  return {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`, // Fixed string interpolation
    to,
    subject,
    html,
  };
}

async function logEmail({ recipients, subject, message, type }) {
  await EmailLog.create({ recipients, subject, message, type });
}
exports.sendSingleEmail = async (req, res) => {
  const { to, subject, message } = req.body;
  if (!to || !subject || !message) {
    return res.status(400).json({ success: false, error: "to, subject and message are required" });
  }
  try {
    await transporter.sendMail(
      buildMailOptions({
        to,
        subject,
        html: `<p>${message}</p>`, // Corrected string interpolation
        //create function to send email for fee defaulter and absentee
      })
    );
    await logEmail({ recipients: [to], subject, message, type: "single" });
    res.json({ success: true, info: "Email sent & logged (single)" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.sendGroupEmail = async (req, res) => {
  const { recipients, subject, message } = req.body;
  if (!Array.isArray(recipients) || !subject || !message) {
    return res.status(400).json({ success: false, error: "recipients array, subject and message are required" });
  }
  try {
    await transporter.sendMail(
      buildMailOptions({
        to: recipients.join(","),
        subject,
        html: `<p>${message}</p>`, // Corrected string interpolation
      })
    );
    await logEmail({ recipients, subject, message, type: "group" });
    res.json({ success: true, info: `Email sent & logged (group: ${recipients.length})` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.sendDefaulterEmail = async (req, res) => {
  const { recipients, subject = "Fee Defaulter Notice", message } = req.body;
  if (!Array.isArray(recipients) || !message) {
    return res.status(400).json({ success: false, error: "recipients array and message are required" });
  }
  try {
    await transporter.sendMail(
      buildMailOptions({
        to: recipients.join(","),
        subject,
        html: `<p>${message}</p>`, // Corrected string interpolation
      })
    );
    await logEmail({ recipients, subject, message, type: "defaulter" });
    res.json({ success: true, info: `Defaulter email sent & logged (${recipients.length})` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.sendAbsentEmail = async (req, res) => {
  const { recipients, subject = "Absent Notice", message } = req.body;
  if (!Array.isArray(recipients) || !message) {
    return res.status(400).json({ success: false, error: "recipients array and message are required" });
  }
  try {
    await transporter.sendMail(
      buildMailOptions({
        to: recipients.join(","),
        subject,
        html: `<p>${message}</p>`, // Corrected string interpolation
      })
    );
    await logEmail({ recipients, subject, message, type: "absent" });
    res.json({ success: true, info: `Absent email sent & logged (${recipients.length})` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Add this at the bottom of the file:
exports.getEmailHistory = async (req, res) => {
  try {
    const logs = await EmailLog.find().sort({ sentAt: -1 }); // newest first
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

const generateFeeEmail = (name, admissionNo, pendingAmount) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Fee Payment Reminder</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f8f9fa;
      color: #333;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    h2 {
      color: #004085;
    }
    ul {
      list-style-type: none;
      padding-left: 0;
    }
    li {
      margin-bottom: 8px;
    }
    .footer {
      margin-top: 30px;
      font-size: 0.9em;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <h2>Fee Payment Reminder</h2>
    <p>Dear <strong>${name}</strong>,</p>

    <p>This is a gentle reminder that your school fee payment is pending.</p>

    <ul>
      <li><strong>Admission Number:</strong> ${admissionNo}</li>
      <li><strong>Pending Amount:</strong> ₹${pendingAmount}</li>
    </ul>

    <p>Please ensure the payment is completed at the earliest to avoid any late fees or disruptions.</p>

    <p>If you have already made the payment, kindly ignore this message.</p>

    <p>Thank you,<br/>
    Accounts Department</p>

    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
};

const generateAbsenteeEmail = (name, admissionNo, absentDates) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Absence Notification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f8f9fa;
      color: #333;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    h2 {
      color: #721c24;
    }
    ul {
      list-style-type: none;
      padding-left: 0;
    }
    li {
      margin-bottom: 8px;
    }
    .footer {
      margin-top: 30px;
      font-size: 0.9em;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <h2>Absence Notification</h2>
    <p>Dear <strong>${name}</strong>,</p>

    <p>We have noticed that you were absent on the following date(s):</p>

    <ul>
      <li><strong>Admission Number:</strong> ${admissionNo}</li>
      <li><strong>Absent Date(s):</strong> ${absentDates.join(", ")}</li>
    </ul>

    <p>Please ensure your attendance in upcoming classes and submit any necessary documentation for your absence if applicable.</p>

    <p>If you believe this is an error, kindly contact the school office as soon as possible.</p>

    <p>Thank you,<br/>
    Academic Office</p>

    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
};
