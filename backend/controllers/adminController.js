import { getFirebaseAdmin } from "../utils/firebaseAdmin.js";

const getRole = (claims) => claims?.role || "user";

const normalizeEmail = (value) => value?.trim().toLowerCase() || "";

export const listUsers = async (req, res) => {
    try {
        const firebaseAdmin = getFirebaseAdmin();
        if (!firebaseAdmin) {
            return res.status(500).json({ message: "Firebase admin is not configured" });
        }

        const result = await firebaseAdmin.auth().listUsers(1000);
        const users = result.users.map((user) => ({
            uid: user.uid,
            name: user.displayName || user.email?.split("@")[0] || "User",
            email: user.email || "",
            role: getRole(user.customClaims),
            disabled: user.disabled || false,
            createdAt: user.metadata?.creationTime || null,
        }));

        return res.json(users);
    } catch (error) {
        console.error("listUsers error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const allowedRoles = ["user", "admin"];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const firebaseAdmin = getFirebaseAdmin();
        if (!firebaseAdmin) {
            return res.status(500).json({ message: "Firebase admin is not configured" });
        }

        const target = await firebaseAdmin.auth().getUser(req.params.id);
        const superAdminEmail = normalizeEmail(process.env.SUPERADMIN_EMAIL);
        const targetEmail = normalizeEmail(target.email);

        if (superAdminEmail && targetEmail === superAdminEmail) {
            return res.status(400).json({ message: "Cannot modify superadmin" });
        }

        if (getRole(target.customClaims) === "superadmin") {
            return res.status(400).json({ message: "Cannot modify superadmin" });
        }

        await firebaseAdmin.auth().setCustomUserClaims(target.uid, { role });

        return res.json({
            message: "Role updated",
            user: {
                uid: target.uid,
                email: target.email,
                role,
            },
        });
    } catch (error) {
        console.error("updateUserRole error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
