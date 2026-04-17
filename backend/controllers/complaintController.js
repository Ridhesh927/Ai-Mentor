import Complaint from "../models/Complaint.js";

const allowedPriorities = new Set(["low", "medium", "high"]);

const createComplaint = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { subject, message, priority } = req.body || {};
    if (!subject || !message) {
      return res.status(400).json({ message: "subject and message are required" });
    }

    const complaint = await Complaint.create({
      userId: req.user.id,
      subject: String(subject).trim(),
      message: String(message).trim(),
      priority: allowedPriorities.has(priority) ? priority : "medium",
      status: "open",
    });

    return res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    console.error("CREATE COMPLAINT ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const getMyComplaints = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const complaints = await Complaint.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    return res.json({ success: true, data: complaints });
  } catch (error) {
    console.error("GET MY COMPLAINTS ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export { createComplaint, getMyComplaints };
