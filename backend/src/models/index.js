// models/index.js
import { Sequelize } from 'sequelize';
import config from '../config/database.js';
import UserModel from './User.js';
import ZoneModel from './Zone.js';
import CourierModel from './Courier.js';
import ParcelModel from './Parcel.js';
import DeliveryModel from './Delivery.js';

// Déterminer l'environnement
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialisation de Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions || {},
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

// Import des modèles
const User = UserModel(sequelize);
const Zone = ZoneModel(sequelize);
const Courier = CourierModel(sequelize);
const Parcel = ParcelModel(sequelize);
const Delivery = DeliveryModel(sequelize);

// ============================================
// DÉFINITION DES RELATIONS (Comme dans le UML)
// ============================================

// User "1" --> "0..*" Parcel : creates
User.hasMany(Parcel, {
  foreignKey: 'senderId',
  as: 'parcels',
  onDelete: 'SET NULL'
});
Parcel.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'sender'
});

// User "1" --> "0..1" Courier : has account
User.hasOne(Courier, {
  foreignKey: 'userId',
  as: 'courierProfile',
  onDelete: 'SET NULL'
});
Courier.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Zone "1" --> "0..*" Parcel : contains
Zone.hasMany(Parcel, {
  foreignKey: 'zoneId',
  as: 'parcels',
  onDelete: 'RESTRICT'
});
Parcel.belongsTo(Zone, {
  foreignKey: 'zoneId',
  as: 'zone'
});

// Zone "1" --> "0..*" Courier : operates in
Zone.hasMany(Courier, {
  foreignKey: 'currentZoneId',
  as: 'couriers',
  onDelete: 'SET NULL'
});
Courier.belongsTo(Zone, {
  foreignKey: 'currentZoneId',
  as: 'currentZone'
});

// Courier "1" --> "0..*" Delivery : handles
Courier.hasMany(Delivery, {
  foreignKey: 'courierId',
  as: 'deliveries',
  onDelete: 'RESTRICT'
});
Delivery.belongsTo(Courier, {
  foreignKey: 'courierId',
  as: 'courier'
});

// Parcel "1" --> "0..1" Delivery : assigned to
Parcel.hasOne(Delivery, {
  foreignKey: 'parcelId',
  as: 'delivery',
  onDelete: 'CASCADE'
});
Delivery.belongsTo(Parcel, {
  foreignKey: 'parcelId',
  as: 'parcel'
});

// Export des modèles et de l'instance Sequelize
export {
  sequelize,
  User,
  Zone,
  Courier,
  Parcel,
  Delivery
};

export default {
  sequelize,
  User,
  Zone,
  Courier,
  Parcel,
  Delivery
};