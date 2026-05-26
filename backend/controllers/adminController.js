import User from "../models/User.js";

export const listUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("name email role createdAt")
            .sort({ createdAt: -1 });

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

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === "superadmin") {
            return res.status(400).json({ message: "Cannot modify superadmin" });
        }

        user.role = role;
        await user.save();

        return res.json({
            message: "Role updated",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("updateUserRole error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
