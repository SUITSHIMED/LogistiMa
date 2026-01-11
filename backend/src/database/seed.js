import { User, Zone, Courier, Parcel, Delivery } from "../models/index.js";

export const seed = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Vérifier si des données existent déjà
    const userCount = await User.count();
    if (userCount > 0) {
      console.log("⚠️  Database already seeded. Skipping...");
      return;
    }

    // 1. Créer des utilisateurs
    const users = await User.bulkCreate([
      {
        email: "admin@logistima.ma",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz", // password: admin123
        role: "admin"
      },
      {
        email: "dispatcher@logistima.ma",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz",
        role: "dispatcher"
      },
      {
        email: "customer@logistima.ma",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz",
        role: "customer"
      }
    ]);
    console.log("✅ Users created");

    // 2. Créer des zones
    const zones = await Zone.bulkCreate([
      {
        name: "Sidi Maarif",
        coordinates: { 
          type: "Polygon", 
          coordinates: [[[33.5731, -7.6298], [33.5832, -7.6298], [33.5832, -7.6098]]] 
        },
        isActive: true
      },
      {
        name: "Anfa",
        coordinates: { 
          type: "Polygon", 
          coordinates: [[[33.5931, -7.6398], [33.6032, -7.6398], [33.6032, -7.6198]]] 
        },
        isActive: true
      },
      {
        name: "Gauthier",
        coordinates: { 
          type: "Polygon", 
          coordinates: [[[33.6031, -7.6498], [33.6132, -7.6498], [33.6132, -7.6298]]] 
        },
        isActive: true
      }
    ]);
    console.log("✅ Zones created");

    // 3. Créer des couriers
    const couriers = await Courier.bulkCreate([
      {
        fullName: "Mohammed Alami",
        phone: "+212612345678",
        currentZoneId: zones[0].id,
        status: "available",
        maxCapacity: 10,
        currentLoad: 0
      },
      {
        fullName: "Fatima Benani",
        phone: "+212623456789",
        currentZoneId: zones[1].id,
        status: "available",
        maxCapacity: 8,
        currentLoad: 0
      }
    ]);
    console.log("✅ Couriers created");

    // 4. Créer des colis
    const parcels = await Parcel.bulkCreate([
      {
        senderId: users[2].id,
        recipientName: "Ali Mansouri",
        recipientPhone: "+212667890123",
        recipientAddress: "123 Rue Mohamed V, Sidi Maarif, Casablanca",
        zoneId: zones[0].id,
        weight: 2.5,
        status: "pending",
        priority: "high"
      },
      {
        senderId: users[2].id,
        recipientName: "Samira Benkirane",
        recipientPhone: "+212678901234",
        recipientAddress: "456 Boulevard Anfa, Anfa, Casablanca",
        zoneId: zones[1].id,
        weight: 1.2,
        status: "pending",
        priority: "medium"
      }
    ], {
    individualHooks: true
  }
  );
    console.log("✅ Parcels created");

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Zones: ${zones.length}`);
    console.log(`   - Couriers: ${couriers.length}`);
    console.log(`   - Parcels: ${parcels.length}`);
    console.log("\n🔐 Test Credentials:");
    console.log("   Email: customer@logistima.ma");
    console.log("   Password: admin123");

  } catch (error) {
    console.error("❌ Seeding error:", error);
    throw error;
  }
};

// Exécution directe du script
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