import sequelize from "../config/db.js";
import "../models/index.js"; // Import pour charger tous les modèles et relations

export const migrate = async () => {
  try {
    console.log("🔄 Starting database migration...");
    
    // Synchroniser tous les modèles avec la base de données
    await sequelize.sync({ alter: true }); // alter: true modifie les tables existantes
    // Pour production, utilisez { alter: false } et des migrations propres
    
    console.log("✅ Database migration completed successfully!");
    console.log("📋 Tables created:");
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

// Si exécuté directement
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