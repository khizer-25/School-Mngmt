// controllers/NewRegistrationController.js
const StudentRegistration = require('../models/NewRegistration');

// Check if admission number already exists
const checkAdmissionNumber = async (req, res) => {
  try {
    const { admissionNumber } = req.query;

    const existingStudent = await StudentRegistration.findOne({ admissionNumber });

    if (existingStudent) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking admission number:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const registerStudent = async (req, res) => {
  try {
    const {
      firstName, middleName, lastName, dateOfBirth,
      gender, bloodGroup, grade, section, academicYear,
      admissionNumber, rollNumber,totalFees,parentName, relationship,
      phoneNumber, emailAddress, address
    } = req.body;

    const student = new StudentRegistration({
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      gender,
      bloodGroup,
      grade,
      section,
      academicYear,
      admissionNumber,
      rollNumber,
      totalFees,
      parentName,
      relationship,
      phoneNumber,
      emailAddress,
      address,
      studentPhoto: req.files?.studentPhoto?.[0]?.path || '',
      birthCertificate: req.files?.birthCertificate?.[0]?.path || '',
      previousMarksheet: req.files?.previousMarksheet?.[0]?.path || '',
      transferCertificate: req.files?.transferCertificate?.[0]?.path || '',
    });

    await student.save();
    res.status(201).json({ message: 'Student registered successfully', student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
};



// Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await StudentRegistration.find(); // Retrieve all student records from the database
    res.status(200).json({ students });
  } catch (error) {
    console.error('Error occurred while fetching all students', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};



module.exports = { getAllStudents,registerStudent,checkAdmissionNumber };
