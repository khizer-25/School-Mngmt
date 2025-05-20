// controllers/PaymentController.js
const StudentRegistration = require('../models/NewRegistration');
const Payment = require('../models/Fees');

const processPayment = async (req, res) => {
  try {
    const {
      studentName,
      admissionNumber,
      feeType,
      paymentDate,
      amount,
      paymentMethod,
      remarks,
    } = req.body;

    // Create a new payment record
    const newPayment = new Payment({
      studentName,
      admissionNumber,
      feeType,
      paymentDate,
      amount,
      paymentMethod,
      remarks,
    });

    // Save the payment details to the database
    await newPayment.save();

    // Respond with a success message
    res.status(200).json({ success: true, message: 'Payment processed successfully' });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ success: false, error: 'Error processing payment. Please try again later.' });
  }
};


const getFeeDefaulters = async (req, res) => {
  try {
    // Get all registered students
    const students = await StudentRegistration.find();

    const defaulters = [];

for (const student of students) {
  // Sum all payments made by this student
  const payments = await Payment.find({ admissionNumber: student.admissionNumber });
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  // Ensure totalFees is available and not 0
  const totalFees = student.totalFees || 0;

  // If totalFees is 0, set balance to 0 instead of calculating a negative balance
  const balance = totalFees > 0 ? totalFees - totalPaid : 0;

  defaulters.push({
    admissionNumber: student.admissionNumber,
    studentName: `${student.firstName} ${student.lastName}`,
    totalFees,
    totalPaid,
    balance,
  });
}

res.status(200).json(defaulters);


  } catch (error) {
    console.error('Error fetching fee defaulters:', error);
    res.status(500).json({ error: 'Failed to fetch fee defaulters' });
  }
};

const getPaymentsByAdmissionNumber = async (req, res) => {
  try {
    const { admissionNumber } = req.query;

    if (!admissionNumber) {
      return res.status(400).json({ success: false, message: 'admissionNumber is required' });
    }

    const payments = await Payment.find({ admissionNumber: admissionNumber.trim() });

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

  
const getDefaultersByClassAndSection = async (req, res) => {
  const { grade, section } = req.query;

  if (!grade || !section) {
    return res.status(400).json({ message: 'Grade and section are required' });
  }

  // console.log(`Fetching students with Grade: ${grade} and Section: ${section}`);  

  try {
    // Ensure the section is uppercase, as it's case-sensitive
    const students = await StudentRegistration.find({
      grade: grade,
      section: section.toUpperCase(),  // Ensure section is always uppercase
    });

    const defaulters = [];

    for (const student of students) {
      const payments = await Payment.find({ admissionNumber: student.admissionNumber });
      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const totalFees = student.totalFees || 0;
      const balance = totalFees > 0 ? totalFees - totalPaid : 0;

      if (totalFees > 0 && (balance / totalFees) > 0.6) {
        defaulters.push({
          admissionNumber: student.admissionNumber,
          studentName: `${student.firstName} ${student.middleName} ${student.lastName}`,
          grade: student.grade,
          section: student.section,
          totalFees,
          totalPaid,
          balance,
        });
      }
    }

    res.status(200).json(defaulters);
  } catch (error) {
    console.error('Error fetching class/section defaulters:', error);
    res.status(500).json({ error: 'Failed to fetch class/section defaulters' });
  }
};

const getAllDefaulters = async (req, res) => {
  try {
    const students = await StudentRegistration.find(); // Fetch all students

    const defaulters = [];

    for (const student of students) {
      const payments = await Payment.find({ admissionNumber: student.admissionNumber });
      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const totalFees = student.totalFees || 0;
      const balance = totalFees > 0 ? totalFees - totalPaid : 0;

      // Include only if balance is more than 60% of total fees
      if (totalFees > 0 && (balance / totalFees) > 0.6) {
        defaulters.push({
          admissionNumber: student.admissionNumber,
          studentName: `${student.firstName} ${student.middleName || ''} ${student.lastName}`,
          grade: student.grade,
          section: student.section,
          totalFees,
          totalPaid,
          balance,
        });
      }
    }

    res.status(200).json(defaulters);
  } catch (error) {
    console.error('Error fetching all defaulters:', error);
    res.status(500).json({ error: 'Failed to fetch defaulters' });
  }
};




module.exports = { getDefaultersByClassAndSection, getFeeDefaulters, processPayment, getPaymentsByAdmissionNumber,getAllDefaulters };
// module.exports = { processPayment, getFeeDefaulters, getPaymentsByAdmissionNumber };
