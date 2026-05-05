import { User, Course, Report, CommunityPost } from "../models/index.js";

// @desc    Get all Enrollments
// @route   GET /api/admin/enrollments
// @access  Private
export const getAllEnrollments = async (req, res) => {
  try {
    const { type = "stats" } = req.query;

    const users = await User.findAll({
      attributes: ["id", "purchasedCourses", "email", "name"],
    });

    const courses = await Course.findAll({
      attributes: ["id", "priceValue", "title"],
    });

    const coursePriceMap = {};
    courses.forEach(course => {
      coursePriceMap[course.id] = course.priceValue || 0;
    });

    if (type === "stats") {
      let totalEnrollments = 0;
      let totalRevenue = 0;
      let activeUsersSet = new Set();

      const now = new Date();
      const activeThresholdDays = 7;

      users.forEach(user => {
        const purchased = user.purchasedCourses || [];

        if (purchased.length > 0) {
          purchased.forEach(course => {
            totalEnrollments++;
            totalRevenue += coursePriceMap[course.courseId] || 0;

            if (course.progress?.lastWatched) {
              const lastWatched = new Date(course.progress.lastWatched);
              const diffDays = (now - lastWatched) / (1000 * 60 * 60 * 24);

              if (diffDays <= activeThresholdDays) {
                activeUsersSet.add(user.id);
              }
            }
          });
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          totalEnrollments,
          totalUsers: users.length,
          activeUsers: activeUsersSet.size,
          totalRevenue,
          totalCourses: courses.length,
        },
      });
    }

    if (type === "list") {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);

      let enrollments = [];

      users.forEach(user => {
        const purchased = user.purchasedCourses || [];

        purchased.forEach(course => {
          enrollments.push({
            user: user.name,
            email: user.email,
            course: course.courseTitle,
            date: course.purchaseDate,
            amount: coursePriceMap[course.courseId] || 0,
            status: "completed",
          });
        });
      });

      enrollments.sort((a, b) => new Date(b.date) - new Date(a.date));

      const total = enrollments.length;
      const start = (page - 1) * limit;
      const paginatedData = enrollments.slice(start, start + limit);

      return res.status(200).json({
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: paginatedData,
      });
    }

    res.status(400).json({ success: false, message: "Invalid type parameter" });
  } catch (error) {
    console.error("ENROLLMENTS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get all Payments
// @route   GET /api/admin/payments
// @access  Private
export const getAllPayments = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const search = String(req.query.search || "").trim().toLowerCase();

    const users = await User.findAll({
      attributes: ["id", "name", "email", "purchasedCourses"],
    });

    const courses = await Course.findAll({
      attributes: ["id", "title", "priceValue", "currency"],
    });

    const courseMap = {};
    courses.forEach((course) => {
      courseMap[String(course.id)] = {
        title: course.title,
        priceValue: Number(course.priceValue || 0),
        currency: course.currency || "INR",
      };
    });

    let payments = [];

    users.forEach((user) => {
      const purchased = Array.isArray(user.purchasedCourses) ? user.purchasedCourses : [];

      purchased.forEach((item, index) => {
        if (!item || typeof item !== "object") {
          return;
        }

        const parsedCourseId = Number(item.courseId);
        if (!Number.isFinite(parsedCourseId)) {
          return;
        }

        const courseId = parsedCourseId;
        const courseInfo = courseMap[String(courseId)] || {};
        const rawAmount = item.amount ?? courseInfo.priceValue ?? 0;
        const parsedAmount = Number(rawAmount);
        const amount = Number.isFinite(parsedAmount) ? parsedAmount : 0;
        const purchaseDate = item.purchaseDate || null;

        payments.push({
          paymentId: `${user.id}-${courseId}-${purchaseDate || index}`,
          userId: user.id,
          userName: user.name,
          email: user.email,
          courseId,
          courseTitle: item.courseTitle || courseInfo.title || `Course ${item.courseId}`,
          amount,
          currency: item.currency || courseInfo.currency || "INR",
          status: item.paymentStatus || "paid",
          paymentMethod: item.paymentMethod || null,
          transactionId: item.transactionId || item.orderId || null,
          purchaseDate,
        });
      });
    });

    if (search) {
      payments = payments.filter((payment) => {
        const text = [payment.userName, payment.email, payment.courseTitle, payment.transactionId]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(search);
      });
    }

    payments.sort((a, b) => new Date(b.purchaseDate || 0) - new Date(a.purchaseDate || 0));

    const total = payments.length;
    const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const start = (page - 1) * limit;
    const data = payments.slice(start, start + limit);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      summary: {
        totalPayments: total,
        totalAmount,
      },
      data,
    });
  } catch (error) {
    console.error("GET PAYMENTS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const ensureReportSeed = async () => {
  try {
    await CommunityPost.sync();
    await Report.sync();

    const reportCount = await Report.count();
    if (reportCount > 0) return;

    // Get or create users
    let users = await User.findAll({ limit: 2 });
    if (users.length < 2) {
      const dummyUsers = await User.bulkCreate([
        {
          name: "John Reporter",
          email: "john@example.com",
          role: "user",
        },
        {
          name: "Alice Author",
          email: "alice@example.com",
          role: "user",
        },
      ]);
      users = dummyUsers;
    }

    // Get or create post
    let post = await CommunityPost.findOne();
    if (!post) {
      post = await CommunityPost.create({
        content: "This is a suspicious community post that might get reported.",
        userId: users[1].id,
        type: "global",
      });
    }

    // Create dummy reports
    await Report.bulkCreate([
      {
        reporterId: users[0].id,
        postId: post.id,
        reason: "spam",
        description: "This looks like a spam message to me.",
        status: "pending",
      },
      {
        reporterId: users[0].id,
        postId: post.id,
        reason: "inappropriate",
        description: "The language used here is not suitable for the platform.",
        status: "resolved",
      },
    ]);

    console.log("✅ Reports seeded successfully!");
  } catch (error) {
    console.error("SEED REPORTS ERROR:", error.message);
  }
};

// @desc    Get all Reports
// @route   GET /api/admin/reports
// @access  Private
export const getAllReports = async (req, res) => {
  try {
    await ensureReportSeed();
    const reports = await Report.findAll({
      include: [
        {
          model: User,
          as: "reporter",
          attributes: ["id", "name", "email"],
        },
        {
          model: CommunityPost,
          as: "post",
          attributes: ["id", "content"],
          include: [
            {
              model: User,
              as: "author",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("GET REPORTS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
