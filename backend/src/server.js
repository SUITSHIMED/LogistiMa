import app from "./app.js";
import sequelize from "./config/db.js";
import "./models/index.js";
import "./database/migrate.js";
import "./database/seed.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    console.log("🚀 Starting LogistiMa Server...");
    
    // 1. Tester la connexion à la base de données
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // 2. Exécuter les migrations
    // console.log("\n📦 Running migrations...");
    // await migrate();

    // 3. Seeder la base (uniquement en dev)
    if (process.env.NODE_ENV === "development" && process.env.SEED_DB === "true") {
      console.log("\n🌱 Seeding database...");
      await seed();
    }

    // 4. Démarrer le serveur
    app.listen(PORT, () => {
      console.log("\n🎉 Server is ready!");
      console.log(`📡 Server running on http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/`);
      console.log(`🔌 API routes: http://localhost:${PORT}/api`);
      console.log(`\n⏰ Started at: ${new Date().toLocaleString()}`);
    });

  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

// Gérer l'arrêt propre du serveur
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await sequelize.close();
  console.log("✅ Database connection closed");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 SIGTERM received, shutting down...");
  await sequelize.close();
  console.log("✅ Database connection closed");
  process.exit(0);
});

startServer();