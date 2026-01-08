import { User, Zone, Courier, Parcel, Delivery } from "../models/index.js";

export const seed = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Créer un utilisateur de test
    const user = await User.create({
      email: "test@logistima.ma",
      passwordHash: "hashed_password_here",
      role: "customer"
    });

    // Créer une zone de test
    const zone = await Zone.create({
      name: "Sidi Maarif",
      coordinates: { type: "Polygon", coordinates: [] },
      isActive: true
    });

    console.log("✅ Seed completed!");
    console.log(`   - User created: ${user.email}`);
    console.log(`   - Zone created: ${zone.name}`);

  } catch (error) {
    console.error("❌ Seeding error:", error);
    throw error;
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log("✅ Seeding completed. Exiting...");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}