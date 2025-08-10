import { DataTypes, Model, Optional, ModelStatic } from "sequelize";
import { sequelize } from "../config/sequelize";

interface StatusHistoryAttributes {
  history_id: number;
  changed_at: Date;
  old_status: string;
  new_status: string;
  ticket_id: string; 
  changed_by_user_id: string; 
  createdAt?: Date;
  updatedAt?: Date;
}

type StatusHistoryCreationAttributes = Optional<
  StatusHistoryAttributes,
  "history_id" | "createdAt" | "updatedAt"
>;

class StatusHistory
  extends Model<StatusHistoryAttributes, StatusHistoryCreationAttributes>
  implements StatusHistoryAttributes
{
  public history_id!: number;
  public changed_at!: Date;
  public old_status!: string;
  public new_status!: string;
  public ticket_id!: string;
  public changed_by_user_id!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: { [key: string]: ModelStatic<Model> }): void {
    StatusHistory.belongsTo(models.Ticket, { foreignKey: "ticket_id" });
    StatusHistory.belongsTo(models.User, { foreignKey: "changed_by_user_id", as: "changedByUser" });
  }
}

StatusHistory.init(
  {
    history_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    changed_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    old_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    new_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    ticket_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "tickets",
        key: "ticket_id",
      },
    },
    changed_by_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
  },
  {
    sequelize,
    modelName: "StatusHistory",
    tableName: "status_history",
    timestamps: true,
  }
);

export default StatusHistory;
