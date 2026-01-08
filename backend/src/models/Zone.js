import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Zone = sequelize.define('Zone', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    coordinates: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: 'Polygon géographique de la zone'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'zones',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  return Zone;
};