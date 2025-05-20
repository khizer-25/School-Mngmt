const Certificate = require('../models/Certificate.js');
const PDFDocument = require('pdfkit');

// Create a new Bonafide certificate
const createBonafide = async (req, res) => {
  const { studentFullName, admissionNumber, className, section, academicYear, issueDate, reason } = req.body;

  if (!studentFullName || !admissionNumber || !className || !section || !issueDate || !reason) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newCertificate = new Certificate({
      studentFullName,
      admissionNumber,
      className,
      section,
      academicYear,
      issueDate,
      reason,
    });

    await newCertificate.save();
    res.status(201).json({ message: 'Certificate generated successfully', certificate: newCertificate });
  } catch (error) {
    res.status(500).json({ error: 'Error generating certificate', message: error.message });
  }
};

// Get all Bonafide certificates with pagination and search
const getAllBonafides = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;

  try {
    const query = search
      ? {
          $or: [
            { studentFullName: { $regex: search, $options: 'i' } },
            { admissionNumber: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const certificates = await Certificate.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ issueDate: -1 });

    const total = await Certificate.countDocuments(query);

    res.status(200).json({ certificates, total });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching certificates', message: error.message });
  }
};

// Get a Bonafide certificate by ID
const getBonafideById = async (req, res) => {
  const { id } = req.params;
  try {
    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    res.status(200).json(certificate);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching certificate', message: error.message });
  }
};

// Delete a Bonafide certificate
const deleteBonafide = async (req, res) => {
  const { id } = req.params;
  try {
    const certificate = await Certificate.findByIdAndDelete(id);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    res.status(200).json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting certificate', message: error.message });
  }
};

// Download a Bonafide certificate as PDF
const downloadBonafide = async (req, res) => {
  const { id } = req.params;
  try {
    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${certificate.studentFullName.replace(/\s+/g, '_')}_certificate.pdf`
    );

    doc.pipe(res);
     
   // School header
   doc.fontSize(16).text('Gyanam School', { align: 'center' });
   doc.fontSize(12).text('#20-4-159, Syed Ali Chabutra, Shah Ali Banda Road, Hyderabad-65', { align: 'center' });
   doc.moveDown(0.5);
   
   // Add a horizontal line
   doc.moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke();
   doc.moveDown(1);

    // Certificate content (customize as needed)
    doc.fontSize(20).text('BONAFIDE CERTIFICATE', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12).text(`This is to certify that ${certificate.studentFullName},`);
    doc.text(`Admission Number: ${certificate.admissionNumber}, is a bonafide student of our school.`);
    doc.text(`He/She is studying in Class ${certificate.className}, Section ${certificate.section},`);
    doc.text(`for the academic year ${certificate.academicYear}.`);
    doc.text(`This certificate is issued on request for the purpose of: ${certificate.reason}.`);

    doc.moveDown();
    doc.text(`Date of Issue: ${new Date(certificate.issueDate).toLocaleDateString()}`);

    doc.moveDown(4);
    doc.text('____________________', { align: 'right' });
    doc.text('Principal / Headmaster', { align: 'right' });

    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Error generating PDF', message: error.message });
  }
};

// Download all Bonafide certificates as a single PDF
const downloadAllBonafides = async (req, res) => {
  try {
    // Get the search parameter, if any
    const { search = '' } = req.query;
    
    // Create query for search if provided
    const query = search
      ? {
          $or: [
            { studentFullName: { $regex: search, $options: 'i' } },
            { admissionNumber: { $regex: search, $options: 'i' } },
          ],
        }
      : {};
    
    // Fetch all certificates matching the query
    const certificates = await Certificate.find(query).sort({ issueDate: -1 });
    
    if (certificates.length === 0) {
      return res.status(404).json({ error: 'No certificates found' });
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=all_bonafide_certificates.pdf');
    
    // Create a single PDF document with all certificates
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: 'All Bonafide Certificates',
        Author: 'School Management System',
      }
    });
    
    // Pipe the PDF into the response
    doc.pipe(res);
    
    // For each certificate
    for (let i = 0; i < certificates.length; i++) {
      const certificate = certificates[i];
      
      // For the first page, we don't need to add a page
      if (i > 0) {
        doc.addPage();
      }
      
      // School header
      doc.fontSize(16).text('Gyanam School', { align: 'center' });
      doc.fontSize(12).text('#20-4-159, Syed Ali Chabutra, Shah Ali Banda Road, Hyderabad-65', { align: 'center' });
      doc.moveDown(0.5);
      
      // Add a horizontal line
      doc.moveTo(50, doc.y)
         .lineTo(doc.page.width - 50, doc.y)
         .stroke();
      doc.moveDown(1);
      
      // Certificate title
      doc.fontSize(20).text('BONAFIDE CERTIFICATE', { align: 'center' });
      doc.moveDown(1);
      
      // Certificate number
      doc.fontSize(10).text(`Certificate ${i + 1} of ${certificates.length}`, { align: 'center' });
      doc.moveDown(1);
      
      // Certificate content
      doc.fontSize(12).text(`This is to certify that ${certificate.studentFullName},`);
      doc.moveDown(0.5);
      doc.text(`Admission Number: ${certificate.admissionNumber}, is a bonafide student of our school.`);
      doc.moveDown(0.5);
      doc.text(`He/She is studying in Class ${certificate.className}, Section ${certificate.section},`);
      doc.moveDown(0.5);
      doc.text(`for the academic year ${certificate.academicYear}.`);
      doc.moveDown(0.5);
      doc.text(`This certificate is issued on request for the purpose of: ${certificate.reason}.`);
      
      doc.moveDown(1);
      doc.text(`Date of Issue: ${new Date(certificate.issueDate).toLocaleDateString()}`);
      
      doc.moveDown(3);
      doc.text('____________________', { align: 'right' });
      doc.text('Principal / Headmaster', { align: 'right' });
    }
    
    // End the document
    doc.end();
    
  } catch (error) {
    console.error('Error generating all PDFs:', error);
    res.status(500).json({ error: 'Error generating PDFs', message: error.message });
  }
};

module.exports = {
  createBonafide,
  getAllBonafides,
  getBonafideById,
  deleteBonafide,
  downloadBonafide,
  downloadAllBonafides,
};