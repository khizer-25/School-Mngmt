
const Enquiry = require('../models/Enquiry');
const { Parser } = require('json2csv');

const submitEnquiry = async (req, res) => {
  try {
    const enquiry = new Enquiry(req.body);
    await enquiry.save();
    res.status(201).json({ message: 'Enquiry submitted successfully' });
  } catch (error) {
    console.error('Error saving enquiry:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const downloadEnquiryHistory = async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: 'Start and end dates are required' });
  }

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999); // ✅ include entire end day

    const enquiries = await Enquiry.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    if (!enquiries.length) {
      return res.status(404).json({ error: 'No enquiries found for the given date range' });
    }

    const fields = [
      'studentName',
      'parentName',
      'contactNumber',
      'email',
      'classInterested',
      'communicationMode',
      'message',
      'createdAt',
    ];
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(enquiries);

    res.header('Content-Type', 'text/csv');
    res.attachment(`enquiry-history-${start}-to-${end}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error('Error generating CSV:', err);
    res.status(500).json({ error: 'Server error while fetching enquiry history' });
  }
};

const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.status(200).json(enquiries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch enquiry history' });
  }
};


module.exports = {
  submitEnquiry,
  getAllEnquiries,
  downloadEnquiryHistory
};
