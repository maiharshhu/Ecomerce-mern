import { getFirebaseAdmin } from "../utils/firebaseAdmin.js";

const normalizeEmail = (value) => value?.trim().toLowerCase() || "";

const getSuperAdminEmail = () => normalizeEmail(process.env.SUPERADMIN_EMAIL);

const syncSuperAdminClaim = async (firebaseAdmin, decoded) => {
    const superAdminEmail = getSuperAdminEmail();
    const decodedEmail = normalizeEmail(decoded.email);

    if (!superAdminEmail || decodedEmail !== superAdminEmail) {
        return "user";
    }

    if (decoded.role === "superadmin") {
        return "superadmin";
    }

    await firebaseAdmin.auth().setCustomUserClaims(decoded.uid, {
        ...(decoded.customClaims || {}),
        role: "superadmin",
    });

    return "superadmin";
};

export const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const firebaseAdmin = getFirebaseAdmin();
        if (!firebaseAdmin) {
            return res.status(500).json({ message: "Firebase admin is not configured" });
        }

        const decoded = await firebaseAdmin.auth().verifyIdToken(token);
        const role = await syncSuperAdminClaim(firebaseAdmin, decoded);

        req.user = {
            id: decoded.uid,
            email: decoded.email || "",
            name: decoded.name || "",
            role: role || decoded.role || "user",
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