const StudentRegistration = require('../models/NewRegistration');
const Payment = require('../models/Fees');
const Enquiry = require('../models/Enquiry');
const Certificate=require('../models/Certificate'); 

const getDashboardStats = async (req, res) => {
  try {
    // Total Students
    const totalStudents = await StudentRegistration.countDocuments();

    // Total Fee Collection
    const feeAggregation = await Payment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);
    const totalFeeCollection = feeAggregation[0]?.total || 0;

    // Total Enquiries
    const totalEnquiries = await Enquiry.countDocuments();

    // Certificates Generated
    // (👉 If you have a model for certificates, fetch the count here)
    // For now, let's hardcode to 25 as a placeholder.
    const certificatesGenerated = await Certificate.countDocuments();

    res.status(200).json({
      totalStudents,
      totalFeeCollection,
      totalEnquiries,
      certificatesGenerated,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

module.exports = { getDashboardStats };
