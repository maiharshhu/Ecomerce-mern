import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // check for already exist user
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: "User Not found." })
        }

        //compare password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }

        // generate jwt token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        res.json({
            message: "Login Successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    }

    catch (error) {
        console.error("loginUser error:", error);
        res.status(500).json({ message: "Server error" })
    }
}

export const signupUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        // check for already exist user
        const normalizedEmail = email.trim().toLowerCase();
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: "User Already Exist.." })
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 10);

        //create new user
        await User.create({
            name,
            email: normalizedEmail,
            password: hashPassword
        });

        res.status(201).json({ message: "User Registered Successfully" })
    }
    catch (error) {
        console.error("signupUser error:", error);
        res.status(500).json({ message: "Server error" })
    }
}