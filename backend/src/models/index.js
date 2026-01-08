// src/models/index.js
import { Sequelize } from 'sequelize';

import UserModel from './User.js';
import ZoneModel from './Zone.js';
import CourierModel from './Courier.js';
import ParcelModel from './Parcel.js';
import DeliveryModel from './Delivery.js';

/**
 * ============================================================================
 * Sequelize initialization (process.env ONLY)
 * ============================================================================
 */

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    dialect: process.env.DB_DIALECT || 'postgres',

    logging:
      process.env.DB_LOGGING === 'true'
        ? console.log
        : false,

    pool: {
      max: Number(process.env.DB_POOL_MAX || 10),
      min: Number(process.env.DB_POOL_MIN || 0),
      acquire: Number(process.env.DB_POOL_ACQUIRE || 30000),
      idle: Number(process.env.DB_POOL_IDLE || 10000),
    },

    dialectOptions:
      process.env.DB_SSL === 'true'
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},

    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

/**
 * ============================================================================
 * Model initialization
 * ============================================================================
 */

const User = UserModel(sequelize);
const Zone = ZoneModel(sequelize);
const Courier = CourierModel(sequelize);
const Parcel = ParcelModel(sequelize);
const Delivery = DeliveryModel(sequelize);

/**
 * ============================================================================
 * Model relationships (UML-aligned)
 * ============================================================================
 */

// User → Parcel (creates)
User.hasMany(Parcel, {
  foreignKey: 'senderId',
  as: 'parcels',
  onDelete: 'SET NULL',
});
Parcel.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'sender',
});

// User → Courier (account)
User.hasOne(Courier, {
  foreignKey: 'userId',
  as: 'courierProfile',
  onDelete: 'SET NULL',
});
Courier.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Zone → Parcel (contains)
Zone.hasMany(Parcel, {
  foreignKey: 'zoneId',
  as: 'parcels',
  onDelete: 'RESTRICT',
});
Parcel.belongsTo(Zone, {
  foreignKey: 'zoneId',
  as: 'zone',
});

// Zone → Courier (operates in)
Zone.hasMany(Courier, {
  foreignKey: 'currentZoneId',
  as: 'couriers',
  onDelete: 'SET NULL',
});
Courier.belongsTo(Zone, {
  foreignKey: 'currentZoneId',
  as: 'currentZone',
});

// Courier → Delivery (handles)
Courier.hasMany(Delivery, {
  foreignKey: 'courierId',
  as: 'deliveries',
  onDelete: 'RESTRICT',
});
Delivery.belongsTo(Courier, {
  foreignKey: 'courierId',
  as: 'courier',
});

// Parcel → Delivery (assigned)
Parcel.hasOne(Delivery, {
  foreignKey: 'parcelId',
  as: 'delivery',
  onDelete: 'CASCADE',
});
Delivery.belongsTo(Parcel, {
  foreignKey: 'parcelId',
  as: 'parcel',
});

/**
 * ============================================================================
 * Exports
 * ============================================================================
 */

export {
  sequelize,
  User,
  Zone,
  Courier,
  Parcel,
  Delivery,
};

export default {
  sequelize,
  User,
  Zone,
  Courier,
  Parcel,
  Delivery,
};
