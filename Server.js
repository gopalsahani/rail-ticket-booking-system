const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const { pool } = require("./db");  
 

const app = express();

//environment variables
dotenv.config();

// Middleware
app.use(morgan("dev"));
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.use("/api/auth",require("./AuthRoutes"));  
app.use("/api/train",require("./Trainroutes"));

const connectDB = async () => {
    try {
        await pool.query("SELECT 1"); 
        console.log(" Connected to MySQL database: rail");
 
        app.listen(PORT, () => {
            console.log(`Server is running on ${process.env.NODE_MODE} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error("MySQL Connection Failed:", error.message);
       
    }
};
 
connectDB();

module.exports = app;
