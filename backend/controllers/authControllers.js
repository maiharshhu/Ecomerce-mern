import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getFirebaseAdmin } from "../utils/firebaseAdmin.js";

const getSuperAdminEmail = () =>
    process.env.SUPERADMIN_EMAIL?.trim().toLowerCase() || "";

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

        if (user.authProvider === "firebase") {
            return res.status(400).json({ message: "Use Firebase login for this account" });
        }

        if (!user.password) {
            return res.status(400).json({ message: "Use Firebase login for this account" });
        }

        //compare password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }

        const superAdminEmail = getSuperAdminEmail();
        if (superAdminEmail && user.email.toLowerCase() === superAdminEmail && user.role !== "superadmin") {
            user.role = "superadmin";
            await user.save();
        }

        // generate jwt token
        const role = user.role || "user";

        const token = jwt.sign(
            { id: user._id, role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        res.json({
            message: "Login Successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role
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
            password: hashPassword,
            role: "user",
            authProvider: "local"
        });

        res.status(201).json({ message: "User Registered Successfully" })
    }
    catch (error) {
        console.error("signupUser error:", error);
        res.status(500).json({ message: "Server error" })
    }
}

export const firebaseLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ message: "Firebase idToken is required" });
        }

        const firebaseAdmin = getFirebaseAdmin();
        if (!firebaseAdmin) {
            return res.status(500).json({ message: "Firebase admin is not configured" });
        }

        const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
        const email = decoded.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({ message: "Firebase user email is missing" });
        }

        let roleFromClaims = decoded.role || "user";
        const superAdminEmail = getSuperAdminEmail();

        if (superAdminEmail && email === superAdminEmail && roleFromClaims !== "superadmin") {
            await firebaseAdmin.auth().setCustomUserClaims(decoded.uid, {
                role: "superadmin",
            });
            roleFromClaims = "superadmin";
        }

        let user = await User.findOne({ email });

        if (!user) {
            const name = decoded.name || email.split("@")[0];
            user = await User.create({
                name,
                email,
                firebaseUid: decoded.uid,
                authProvider: "firebase",
                role: roleFromClaims
            });
        } else {
            const updates = {};

            if (!user.firebaseUid) {
                updates.firebaseUid = decoded.uid;
            }

            if (user.authProvider !== "firebase") {
                updates.authProvider = "firebase";
            }

            if (user.role !== roleFromClaims) {
                updates.role = roleFromClaims;
            }

            if (Object.keys(updates).length > 0) {
                user = await User.findByIdAndUpdate(user._id, updates, { new: true });
            }
        }

        const role = user.role || roleFromClaims || "user";
        const token = jwt.sign(
            { id: user._id, role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.json({
            message: "Login Successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role
            }
        });
    } catch (error) {
        console.error("firebaseLogin error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}