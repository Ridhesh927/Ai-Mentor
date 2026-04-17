import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createComplaint, getMyComplaints } from "../controllers/complaintController.js";

const router = express.Router();

router.post("/", protect, createComplaint);
router.get("/my", protect, getMyComplaints);

export default router;
