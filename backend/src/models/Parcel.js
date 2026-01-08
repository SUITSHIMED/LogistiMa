import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Parcel = sequelize.define('Parcel', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    trackingNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'tracking_number'
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'sender_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    recipientName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'recipient_name'
    },
    recipientPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'recipient_phone'
    },
    recipientAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'recipient_address'
    },
    zoneId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'zone_id',
      references: {
        model: 'zones',
        key: 'id'
      }
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'assigned', 'in_transit', 'delivered', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
      allowNull: false
    }
  }, {
    tableName: 'parcels',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['tracking_number']
      },
      {
        fields: ['status']
      },
      {
        fields: ['zone_id']
      },
      {
        fields: ['created_at']
      }
    ],
    hooks: {
      beforeCreate: (parcel) => {
        if (!parcel.trackingNumber) {
          parcel.trackingNumber = `LM${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        }
      }
    }
  });

  return Parcel;
};
