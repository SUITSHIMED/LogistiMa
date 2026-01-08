import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Delivery = sequelize.define('Delivery', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    parcelId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: 'parcel_id',
      references: {
        model: 'parcels',
        key: 'id'
      }
    },
    courierId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'courier_id',
      references: {
        model: 'couriers',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('assigned', 'picked_up', 'in_transit', 'delivered', 'failed'),
      defaultValue: 'assigned',
      allowNull: false
    },
    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'assigned_at'
    },
    pickedUpAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'picked_up_at'
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'delivered_at'
    },
    routeData: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'route_data',
      comment: 'Itinéraire calculé par le worker'
    },
    receiptUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'receipt_url'
    }
  }, {
    tableName: 'deliveries',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['parcel_id']
      },
      {
        fields: ['courier_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      }
    ],
    hooks: {
      afterCreate: async (delivery, options) => {
        // Mettre à jour le statut du colis
        const Parcel = sequelize.models.Parcel;
        await Parcel.update(
          { status: 'assigned' },
          { where: { id: delivery.parcelId }, transaction: options.transaction }
        );

        // Incrémenter le currentLoad du courier
        const Courier = sequelize.models.Courier;
        await Courier.increment(
          'currentLoad',
          { where: { id: delivery.courierId }, transaction: options.transaction }
        );
      },
      afterUpdate: async (delivery, options) => {
        if (delivery.changed('status')) {
          const Parcel = sequelize.models.Parcel;
          
          // Mapper le statut de delivery vers parcel
          const statusMap = {
            'assigned': 'assigned',
            'picked_up': 'in_transit',
            'in_transit': 'in_transit',
            'delivered': 'delivered',
            'failed': 'cancelled'
          };
          
          await Parcel.update(
            { status: statusMap[delivery.status] },
            { where: { id: delivery.parcelId }, transaction: options.transaction }
          );

          // Décrémenter currentLoad si livraison terminée
          if (delivery.status === 'delivered' || delivery.status === 'failed') {
            const Courier = sequelize.models.Courier;
            await Courier.decrement(
              'currentLoad',
              { where: { id: delivery.courierId }, transaction: options.transaction }
            );
          }
        }
      }
    }
  });

  return Delivery;
};