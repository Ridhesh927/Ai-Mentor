import { User } from "../models/index.js";

// @desc    Get all Users
// @route   GET /api/admin/users
// @access  Private
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "purchasedCourses", "createdAt"],
    });
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
