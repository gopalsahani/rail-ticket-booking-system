const express = require("express");
const { pool } = require("../config/db");
const jwt = require("jsonwebtoken");

const router = express.Router();

// authentication
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized, no token provided" });
    }

    const token = authHeader.split(" ")[1];  

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};

//  add Train --for admin
router.post("/add-train", authenticate, async (req, res) => {
    console.log("Decoded user:", req.user);  

    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
    }

    const { name, source, destination, total_seats } = req.body;
    await pool.query("INSERT INTO trains (name, source, destination, total_seats, available_seats) VALUES (?, ?, ?, ?, ?)", 
        [name, source, destination, total_seats, total_seats]);

    res.json({ message: "Train added successfully" });
});

//   availibilty
router.get("/availability", async (req, res) => {
    try {
        const { source, destination } = req.query;
        console.log("Query Params:", source, destination);  

        const [trains] = await pool.query("SELECT * FROM trains WHERE source = ? AND destination = ?", [source, destination]);

        console.log("Trains Found:", trains);  
        res.json(trains);
    } catch (error) {
        console.error("Error fetching trains:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//   seat booking
router.post("/book-seat", authenticate, async (req, res) => {
    const { train_id, seats } = req.body;
    const [train] = await pool.query("SELECT * FROM trains WHERE id = ?", [train_id]);

    if (train.length === 0) return res.status(404).json({ error: "Train not found" });
    if (train[0].available_seats < seats) return res.status(400).json({ error: "Not enough seats available" });

    await pool.query("UPDATE trains SET available_seats = available_seats - ? WHERE id = ?", [seats, train_id]);
    await pool.query("INSERT INTO bookings (user_id, train_id, seats) VALUES (?, ?, ?)", [req.user.userId, train_id, seats]);

    res.json({ message: "Booking successful" });
});

//  booking details
router.get("/booking-details", authenticate, async (req, res) => {
    const [bookings] = await pool.query("SELECT * FROM bookings WHERE user_id = ?", [req.user.userId]);
    res.json(bookings);
});

module.exports = router;
