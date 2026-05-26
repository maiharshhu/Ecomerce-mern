import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("name email role");

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        req.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || "user",
        };

        return next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export const requireAdmin = (req, res, next) => {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
        return res.status(403).json({ message: "Admin access required" });
    }

    return next();
};

export const requireSuperAdmin = (req, res, next) => {
    if (req.user?.role !== "superadmin") {
        return res.status(403).json({ message: "Super admin access required" });
    }

    return next();
};
