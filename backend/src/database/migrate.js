import sequelize from "../config/db.js";

export const migrate = async () => {
  try {
    await sequelize.sync({ alter: false });
    console.log("Database ready");
  } catch (error) {
    console.error(" Migration error:", error);
    throw error;
  }
};
