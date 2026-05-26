import express from "express";
import { listUsers, updateUserRole } from "../controllers/adminController.js";
import { authenticate, requireSuperAdmin } from "../middleware/firebaseAuth.js";

const router = express.Router();

router.get("/users", authenticate, requireSuperAdmin, listUsers);
router.patch("/users/:id/role", authenticate, requireSuperAdmin, updateUserRole);

export default router;
