// backendAdmin/list_tables.js
import { sequelize } from "./config/db.js";
import dotenv from "dotenv";
dotenv.config();

async function list() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log("Tables in public schema:");
    results.forEach(r => console.log(` - ${r.table_name}`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

list();
