import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Courier = sequelize.define('Courier', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'full_name'
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^[0-9+\-\s()]+$/
      }
    },
    currentZoneId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'current_zone_id',
      references: {
        model: 'zones',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('available', 'busy', 'offline'),
      defaultValue: 'offline',
      allowNull: false
    },
    maxCapacity: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      allowNull: false,
      field: 'max_capacity',
      validate: {
        min: 1,
        max: 50
      }
    },
    currentLoad: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: 'current_load',
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'couriers',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['current_zone_id']
      },
      {
        fields: ['status', 'current_zone_id'],
        where: {
          status: 'available'
        }
      }
    ],
    validate: {
      capacityCheck() {
        if (this.currentLoad > this.maxCapacity) {
          throw new Error('Current load cannot exceed max capacity');
        }
      }
    },
    hooks: {
      beforeUpdate: (courier) => {
        if (courier.changed('currentLoad') && courier.currentLoad > courier.maxCapacity) {
          throw new Error('Cannot exceed max capacity');
        }
      }
    }
  });

  return Courier;
};
