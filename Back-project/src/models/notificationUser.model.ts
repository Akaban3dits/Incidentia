import { DataTypes, Model, Optional, ModelStatic } from "sequelize";
import { sequelize } from "../config/sequelize";

interface NotificationUserAttributes {
  notification_id: number;  
  user_id: string;          
  read_at?: Date | null;
  hidden: boolean;
}

type NotificationUserCreationAttributes = Optional<
  NotificationUserAttributes,
  "read_at"
>;

class NotificationUser
  extends Model<NotificationUserAttributes, NotificationUserCreationAttributes>
  implements NotificationUserAttributes
{
  public notification_id!: number;
  public user_id!: string;
  public read_at!: Date | null;
  public hidden!: boolean;

  public static associate(models: { [key: string]: ModelStatic<Model> }): void {
    NotificationUser.belongsTo(models.Notification, {
      foreignKey: "notification_id",
      as: "notification",
      onDelete: "CASCADE",
    });

    NotificationUser.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  }
}

NotificationUser.init(
  {
    notification_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "notifications",
        key: "notification_id",
      },
    },
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    hidden: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "NotificationUser",
    tableName: "notification_users",
    timestamps: false,
  }
);

export default NotificationUser;
