import { Course } from "../models/index.js";

// @desc    Get all Courses
// @route   GET /api/admin/courses
// @access  Private
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      attributes: ["id", "title", "category", "priceValue", "currency", "createdAt", "updatedAt"],
    });
    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("GET COURSES ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Create a new Course
// @route   POST /api/admin/courses
// @access  Private
export const createCourse = async (req, res) => {
  try {
    const { title, category, priceValue, currency } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const course = await Course.create({
      title,
      category,
      priceValue: parseFloat(priceValue) || 0,
      currency: currency || "INR",
    });

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("CREATE COURSE ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
