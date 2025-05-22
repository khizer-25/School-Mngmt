import React, { useState } from 'react';

const SendSingleEmail = () => {
    const [searchType, setSearchType] = useState('admission');
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [studentData, setStudentData] = useState(null);
    const maxCharacters = 500;;

    const emailTemplates = {
    welcome: "Assalam Alaikum.🎉Welcome to our school! We're excited to have you join us. Please reach out if you have any questions.",
    reminder: "Assalam Alaikum.📌This is a gentle reminder to submit the required documents for your admission process.",
    feeNotice: "Assalam Alaikum.Your school fee is due. Kindly make the payment by the end of this week to avoid any late fees.",
    PTMreminder: "Assalam Alaikum.This is a reminder that the Parent-Teacher Meeting is scheduled for this 📅Saturday. We look forward to discussing your child's progress. Kindly be on time.",
    firstPrize: "Assalam Alaikum.Congratulations on winning the 🏅 first prize! Your child is the Topper in the class. Your dedication and hard work towards your child truly paid off. We are proud of your achievement and look forward to many more successes.",

};  
const [selectedTemplate, setSelectedTemplate] = useState('');


    const handleFindStudent = async () => {
        if (!searchQuery.trim()) {
            alert('Please enter a search query.');
            return;
        }
    
        try {
            let queryString = '';

            if (searchType === 'admission') {
                queryString = `admissionNumber=${searchQuery}`;
            } else if (searchType === 'student') {
                queryString = `studentName=${searchQuery}`;
            }
            
            const response = await fetch(`/api/students/search?${queryString}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            

            // if (!response.ok) {
            //     const errorText = await response.text();
            //     console.error('Error response:', errorText);
            //     alert(`Failed to fetch student. Status: ${response.status}`);
            //     return;
            // }
    
            const data = await response.json();
            if (data.success) {
                setStudentData(data.student);  // Set student data in state
            } else {
                alert('Student not found.');
            }
        } catch (error) {
            alert('Error fetching student data.');
        }
    };
    


    const handleSendEmail = async () => {
        if (!searchQuery.trim() || !message.trim()) {
            alert('Please fill all fields before sending the email.');
            return;
        }
        setLoading(true);

        const emailData = {
            to: studentData ? studentData.emailAddress : searchQuery,// Using student's email if available
            subject: "Important Notice",
            message,
        };

        try {
            const response = await fetch('http://localhost:5000/api/email/sendSingleEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
            });

            const data = await response.json();
            if (data.success) {
                alert(`📨 Email Sent Successfully!\n\nTo: ${emailData.to}\nMessage: ${message}`);
            } else {
                alert('Failed to send email. Please try again.');
            }
        } catch (error) {
            alert('Error sending email. Please try again.');
        } finally {
            setLoading(false);
            setSearchQuery('');
            setMessage('');
        }
    };

    return (
        <div className=" bg-white p-6">
            <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">Send Single Email</h1>

            <div className="bg-white-150 p-6 rounded-2xl shadow mb-10 overflow-x-auto">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <input
                        type="text"
                        placeholder="Search by name or admission ID..."
                        className="flex-1 p-3 rounded-2xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <select
                        className="p-3 rounded-2xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                    >
                        <option value="admission">Admission No</option>
                        <option value="student">Student Name</option>
                    </select>
                    <button
                        onClick={handleFindStudent}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold transition-all duration-300"
                    >
                        Find
                    </button>
                </div>
            </div>

            {studentData && (
                <div className="flex justify-center mb-10">
                    <div className="bg-white border border-blue-200 p-6 rounded-2xl shadow-lg w-full md:w-2/3 text-center">
                    <p className="text-2xl font-semibold text-blue-800 mb-2">
  {studentData.firstName} {studentData.middleName} {studentData.lastName}
</p>
<p className="text-gray-700 text-xl font-bold">Admission No: {studentData.admissionNumber}</p>
<div className="flex justify-center gap-3 mt-4">
    <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Class: {studentData.grade}</span>
    <span className="text-sm text-gray-600 px-3 py-1 rounded-full">Father Name: {studentData.parentName}</span>
    <span className="text-sm text-gray-600 px-3 py-1 rounded-full">Phone: {studentData.phoneNumber}</span>
</div>

                    </div>
                </div>
            )}

           {studentData && (
    <div className="bg-white-150 p-6 rounded-2xl shadow">
        <label className="block text-xl text-blue-700 font-semibold mb-3">Choose Template</label>
        <select
            className="w-full mb-4 p-3 rounded-2xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={selectedTemplate}
            onChange={(e) => {
                const templateKey = e.target.value;
                setSelectedTemplate(templateKey);
                if (emailTemplates[templateKey]) {
                    setMessage(emailTemplates[templateKey]);
                }
            }}
        >
            <option value="">-- Select a Template --</option>
            <option value="welcome">🎉 Welcome Email</option>
            <option value="reminder">📌 Document Reminder</option>
            <option value="feeNotice">💰 Fee Due Notice</option>
            <option value="firstPrize">🏅 First Prize Congratulations</option>
<option value="PTMreminder">📅 PTM Reminder</option>

        </select>

        <label className="block text-xl text-blue-700 font-semibold mb-3">Compose Message</label>
        <textarea
            rows="6"
            placeholder="Type your message here..."
            className="w-full p-4 rounded-2xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            value={message}
            onChange={(e) => {
                if (e.target.value.length <= maxCharacters) {
                    setMessage(e.target.value);
                }
            }}
        ></textarea>

        <div className="text-right text-sm text-blue-500 mt-2">{message.length}/{maxCharacters}</div>

        <button
            onClick={handleSendEmail}
            disabled={loading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center"
        >
            {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                    ></path>
                </svg>
            ) : (
                "Send Email"
            )}
        </button>
    </div>
)}
 
        </div>
    );
};

export default SendSingleEmail;
