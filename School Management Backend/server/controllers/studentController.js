// controllers/StudentController.js
const StudentRegistration = require('../models/NewRegistration');

const getStudentsByClassAndSection = async (req, res) => {
  const { grade, section } = req.query;

  try {
    if (!grade || !section) {
      return res.status(400).json({ message: 'Grade and section are required' });
    }

    const students = await StudentRegistration.find({ grade, section });

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found for the selected class and section' });
    }

    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};


const searchStudent = async (req, res) => {
  try {
      const { studentName, admissionNumber } = req.query;

      let students = [];

      if (admissionNumber) {
          students = await StudentRegistration.find({ admissionNumber: admissionNumber.trim() });
      } else if (studentName) {
          const trimmedInput = studentName.trim().replace(/\s+/g, ' ');

          students = await StudentRegistration.aggregate([
              {
                  $addFields: {
                      trimmedFirstName: { $trim: { input: { $ifNull: ["$firstName", ""] } } },
                      trimmedMiddleName: { $trim: { input: { $ifNull: ["$middleName", ""] } } },
                      trimmedLastName: { $trim: { input: { $ifNull: ["$lastName", ""] } } },
                  }
              },
              {
                  $addFields: {
                      fullName: {
                          $trim: {
                              input: {
                                  $concat: [
                                      "$trimmedFirstName",
                                      {
                                          $cond: [
                                              { $eq: ["$trimmedMiddleName", ""] },
                                              "",
                                              { $concat: [" ", "$trimmedMiddleName"] }
                                          ]
                                      },
                                      {
                                          $cond: [
                                              { $eq: ["$trimmedLastName", ""] },
                                              "",
                                              { $concat: [" ", "$trimmedLastName"] }
                                          ]
                                      }
                                  ]
                              }
                          }
                      }
                  }
              },
              {
                  $match: {
                      $or: [
                          { trimmedFirstName: { $regex: trimmedInput, $options: 'i' } },
                          { trimmedMiddleName: { $regex: trimmedInput, $options: 'i' } },
                          { trimmedLastName: { $regex: trimmedInput, $options: 'i' } },
                          { fullName: { $regex: trimmedInput, $options: 'i' } }
                      ]
                  }
              }
          ]);
      } else {
          return res.status(400).json({ success: false, error: 'Please provide studentName or admissionNumber' });
      }

      if (students.length === 0) {
          return res.status(404).json({ success: false, message: 'Student not found' });
      }

      // ✅ Return the FIRST matched student as `student`
      res.status(200).json({
          success: true,
          student: students[0]
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal server error' });
  }
};



module.exports = { getStudentsByClassAndSection,searchStudent };
