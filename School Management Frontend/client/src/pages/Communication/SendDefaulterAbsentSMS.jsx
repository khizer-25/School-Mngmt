import React, { useState } from "react";
import axios from "axios";

const SendDefaulterAbsentEmail = () => {
  const [activeTab, setActiveTab] = useState("Fee Defaulters");
  const [searchBy, setSearchBy] = useState("admissionNumber");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [showList, setShowList] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const defaultMessages = {
    "Fee Defaulters": `Dear Parent/Guardian,

This is a reminder that your child's school fee is overdue. Please arrange for the payment at the earliest to avoid any inconvenience.

Thank you for your cooperation.

Best regards,
School Administration`,
    "Absent Students": `Dear Parent/Guardian,

We noticed that your child was absent from school today. Kindly inform us of the reason for the absence.

Thank you.

Best regards,
School Administration`
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowList(false);
    setAdmissionNumber("");
    setSearchTerm("");
    setError("");
    setStudents([]);
    setMessage("");
  };

  const handleFind = async () => {
    try {
      setError("");
      setShowList(false);
      let fetchedStudents = [];

      const paramValue = searchBy === "admissionNumber" ? admissionNumber.trim() : searchTerm.trim();
      if (!paramValue) {
        setError(`Please enter ${searchBy === "admissionNumber" ? "Admission Number" : "Student Name"}.`);
        return;
      }

      const res = await axios.get("https://school-mngmt.onrender.com/api/students/search", {
        params: {
          admissionNumber: searchBy === "admissionNumber" ? paramValue : "",
          studentName: searchBy === "studentName" ? paramValue : "",
          type: "student-admission",
        },
      });

      if (res.data.success && res.data.student) {
        fetchedStudents = [res.data.student];
        setMessage(defaultMessages[activeTab]);
      } else {
        setError("No matching student found.");
        setMessage("");
      }

      setStudents(fetchedStudents);
      setShowList(true);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch students.");
    }
  };

  const handleSendEmail = async () => {
    try {
      if (!message.trim()) {
        setError("Please enter an email message.");
        return;
      }
      if (students.length === 0) {
        setError("No students selected to send email.");
        return;
      }

      setIsSending(true);
      setError("");

      const emails = students.map((s) => s.emailAddress).filter(Boolean);

      if (emails.length === 0) {
        setError("No student email addresses found.");
        setIsSending(false);
        return;
      }

      await axios.post("https://school-mngmt.onrender.com/api/email/send-defaulters", {
        recipients: emails,
        subject: `${activeTab} Notification`,
        message,
      });

      alert("Email sent successfully!");
      setMessage("");
    } catch (err) {
      console.error(err);
      setError("Failed to send emails.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white p-6 rounded-xl shadow">
        <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">
          Send Notifications
        </h1>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => handleTabChange("Fee Defaulters")}
            className={`px-4 py-2 font-semibold ${activeTab === "Fee Defaulters"
              ? "text-blue-700 border-b-2 border-blue-700"
              : "text-gray-400"
              }`}
          >
            Fee Defaulters
          </button>
          <button
            onClick={() => handleTabChange("Absent Students")}
            className={`px-4 py-2 font-semibold ${activeTab === "Absent Students"
              ? "text-blue-700 border-b-2 border-blue-700"
              : "text-gray-400"
              }`}
          >
            Absent Students
          </button>
        </div>

        <div className="mb-5">
          <label className="block mb-3 text-xl font-semibold text-blue-700 ml-2">Search by</label>
          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg w-full md:w-1/3 mb-4"
          >
            <option value="admissionNumber">Admission Number</option>
            <option value="studentName">Student Name</option>
          </select>

          {searchBy === "admissionNumber" && (
            <input
              type="text"
              value={admissionNumber}
              onChange={(e) => setAdmissionNumber(e.target.value)}
              placeholder="Enter Admission Number..."
              className="border border-gray-300 p-2 rounded-lg w-full md:w-1/3 mb-4"
            />
          )}

          {searchBy === "studentName" && (
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter Student Name..."
              className="border border-gray-300 p-2 rounded-lg w-full md:w-1/3 mb-4"
            />
          )}

          <button
            onClick={handleFind}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg w-full md:w-auto ml-3"
          >
            Find
          </button>

          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}
        </div>

        {showList && (
          <div className="mb-6">
            {students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700">
                  <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-2">Student Name</th>
                      <th className="px-4 py-2">Parent Name</th>
                      <th className="px-4 py-2">Class</th>
                      <th className="px-4 py-2">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-3">
                          {student.firstName} {student.middleName} {student.lastName}
                        </td>
                        <td className="px-4 py-3">{student.parentName || "N/A"}</td>
                        <td className="px-4 py-3">{student.grade}</td>
                        <td className="px-4 py-3">{student.emailAddress || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-6">
                No students found.
              </div>
            )}
          </div>
        )}

        {showList && students.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-700 mb-2">Email Message</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              className="w-full p-4 border border-gray-300 rounded-lg"
              placeholder={`Type your ${activeTab === "Fee Defaulters" ? "Fee Reminder" : "Absentee"} email here...`}
            />
            <div className="text-sm text-gray-400 mt-1">
              {500 - message.length} characters remaining
            </div>
            <button
              onClick={handleSendEmail}
              disabled={isSending}
              className={`mt-4 px-6 py-2 rounded-lg flex items-center gap-2 justify-center w-full md:w-auto text-white transition-all duration-300 ${isSending
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {isSending ? "Sending..." : "Send Email"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendDefaulterAbsentEmail;
