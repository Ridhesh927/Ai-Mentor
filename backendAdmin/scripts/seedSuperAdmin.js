import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { DataTypes } from "sequelize";
import { connectDB, sequelize } from "../config/db.js";

dotenv.config();

const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("superadmin", "admin"),
      defaultValue: "admin",
    },
  },
  {
    timestamps: true,
    tableName: "Admins",
  }
);

Admin.beforeCreate(async (admin) => {
  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(admin.password, salt);
});

const seedSuperAdmin = async () => {
  const name = process.env.SUPER_ADMIN_NAME || process.env.ADMIN_NAME;
  const email = process.env.SUPER_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error(
      "Missing super admin env vars. Set SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, and SUPER_ADMIN_PASSWORD in backendAdmin/.env"
    );
    process.exit(1);
  }

  try {
    await connectDB();
    await Admin.sync();

    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      console.log("Super admin already exists for this email.");
      process.exit(0);
    }

    await Admin.create({
      name,
      email,
      password,
      role: "superadmin",
    });

    console.log("Super admin created successfully in backendAdmin.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed super admin:", error.message);
    process.exit(1);
  } finally {
    await sequelize.close().catch(() => {});
  }
};

seedSuperAdmin();
