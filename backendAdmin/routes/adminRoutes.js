import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  deleteAdmin,
  logoutAdmin,
  getAllEnrollments,
  getAllPayments,
  getAllCourses,
  getAllUsers,
  getAllAdmins,
  getAdminNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  clearAllNotifications,
} from "../controllers/adminController.js";
import { protectAdmin, superAdminOnly } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

// Public routes
router.post("/login", loginAdmin);

// Protected routes
router.post("/register", protectAdmin, superAdminOnly, registerAdmin);
router.get("/profile", protectAdmin, getAdminProfile);
router.post("/logout", protectAdmin, logoutAdmin);
router.delete("/:id", protectAdmin, superAdminOnly, deleteAdmin);

// Admin data routes
router.get("/enrollments", protectAdmin, getAllEnrollments);
router.get("/payments", protectAdmin, getAllPayments);
router.get("/courses", protectAdmin, getAllCourses);
router.get("/users", protectAdmin, getAllUsers);
router.get("/admins", protectAdmin, superAdminOnly, getAllAdmins);
router.get("/notifications", protectAdmin, getAdminNotifications);
router.patch("/notifications/mark-all-read", protectAdmin, markAllNotificationsRead);
router.patch("/notifications/:id/read", protectAdmin, markNotificationRead);
router.delete("/notifications/clear", protectAdmin, clearAllNotifications);

export default router;
