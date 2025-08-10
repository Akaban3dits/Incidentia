import { DataTypes, Model, Optional, ModelStatic } from "sequelize";
import { sequelize } from "../config/sequelize";
import { NotificationType } from "../enums/notificationType.enum";

interface NotificationAttributes {
  notification_id: number;
  message: string;
  type: NotificationType;
  createdAt?: Date;
  updatedAt?: Date;
  ticket_id?: string | null; // FK UUID Ticket (nullable)
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
    Notification.belongsTo(models.Ticket, { foreignKey: "ticket_id" });
    Notification.belongsToMany(models.User, {
      through: models.NotificationUser,
      foreignKey: "notification_id",
      otherKey: "user_id",
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
  }
);

export default Notification;
