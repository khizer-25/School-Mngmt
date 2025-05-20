const StudentRegistration = require('../models/NewRegistration');

const findStudent = async (req, res) => {
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
      return res.status(400).json({ error: 'Please provide studentName or admissionNumber' });
    }

    if (students.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { findStudent };
