import { sequelize } from "../models/index.js";

export const migrate = async () => {
  try {
    console.log("🔄 Starting database migration...");
    
    // alter: true = modifie les tables existantes
    // force: false = ne supprime pas les tables
    await sequelize.sync({ alter: true });
    
    console.log("✅ Database migration completed successfully!");
    console.log("📋 Tables created/updated:");
    console.log("   - users");
    console.log("   - zones");
    console.log("   - couriers");
    console.log("   - parcels");
    console.log("   - deliveries");
    
  } catch (error) {
    console.error("❌ Migration error:", error);
    throw error;
  }
};

// Exécution directe du script
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate()
    .then(() => {
      console.log("✅ Migration completed. Exiting...");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    });
}