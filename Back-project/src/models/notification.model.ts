import { DataTypes, Model, Optional, ModelStatic } from "sequelize";
import { sequelize } from "../config/sequelize";
import { NotificationType } from "../enums/notificationType.enum";

interface NotificationAttributes {
  notification_id: number;
  message: string;
  type: NotificationType;
  ticket_id?: string | null; 
  createdAt?: Date;
  updatedAt?: Date;
}

type NotificationCreationAttributes = Optional<
  NotificationAttributes,
  "notification_id" | "ticket_id" | "createdAt" | "updatedAt"
>;

class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public notification_id!: number;
  public message!: string;
  public type!: NotificationType;
  public ticket_id!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: { [key: string]: ModelStatic<Model> }): void {
    Notification.belongsTo(models.Ticket, {
      foreignKey: "ticket_id",
      as: "ticket",
      onDelete: "SET NULL", 
    });

    Notification.belongsToMany(models.User, {
      through: models.NotificationUser, 
      foreignKey: "notification_id",
      otherKey: "user_id",
      as: "recipients",
    });
  }

  static initScopes() {
    Notification.addScope("byType", (type: NotificationType) => ({
      where: { type },
    }));
    Notification.addScope("byTicket", (ticket_id: string) => ({
      where: { ticket_id },
    }));
    Notification.addScope("recent", {
      order: [["createdAt", "DESC"]],
    });
  }
}

Notification.init(
  {
    notification_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(NotificationType)),
      allowNull: false,
    },
    ticket_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "tickets",
        key: "ticket_id",
      },
    },
  },
  {
    sequelize,
    modelName: "Notification",
    tableName: "notifications",
    timestamps: true,
    indexes: [
      { fields: ["ticket_id"] },
      { fields: ["type"] },
      { fields: ["createdAt"] },
    ],
  }
);

Notification.initScopes?.();

export default Notification;
