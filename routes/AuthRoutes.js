const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

const router = express.Router();

//  Register 
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, role || "user"]
        );

        res.status(201).json({ message: "User registered", userId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// Login 
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const [user] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (user.length === 0) return res.status(400).json({ error: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ userId: user[0].id, role: user[0].role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
