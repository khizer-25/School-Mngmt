require('dotenv').config();const 
express = require('express');
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const cors = require('cors');
const connectDB = require('./config/db');
const feesRoutes = require('./routes/feesRoutes');
const studentRoutes = require('./routes/studentRoutes');
const NewRegistrationRoutes = require('./routes/NewRegistrationRoutes'); // Ensure this is correctly mounted
const emailRoutes = require('./routes/EmailRoutes'); // Ensure this is correctly mounted
const certificateRoutes = require('./routes/certificateRoutes'); // Ensure correct import path
const paymentRoutes = require('./routes/feesRoutes'); // Ensure this is correctly mounted
const enquiryRoutes = require('./routes/enquiryRoutes'); // Ensure this is correctly mounted
const idCardRoutes = require('./routes/idCardRoutes'); // Ensure this is correctly mounted
const dashboardRoutes = require('./routes/dashboardRoutes'); // Ensure this is correctly mounted

connectDB();


const app = express();
app.use(cors({
    origin: function (origin, callback) {
        if (
            !origin ||
            origin === process.env.CLIENT_URL ||
            /\.vercel\.app$/.test(origin) // allow all vercel preview deployments
        ) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/fees', feesRoutes);
app.use('/api/Newregistration', NewRegistrationRoutes);  // Ensure this is correctly mounted
app.use('/api/students', studentRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/bonafide', certificateRoutes); 
app.use('/api/enquiry', enquiryRoutes); // Ensure this is correctly mounted
app.use("/api/auth", authRoutes);
app.use('/api/idcard', idCardRoutes); // Mount the route
app.use('/api/dashboard', dashboardRoutes); // Mount the route

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Server Error",
        error:
            process.env.NODE_ENV === "development"
                ? err.message
                : "An unexpected error occurred",
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
