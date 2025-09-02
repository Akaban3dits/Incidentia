import { DataTypes, Model, Optional, ModelStatic } from "sequelize";
import { sequelize } from "../config/sequelize";
import { TicketStatus } from "../enums/ticketStatus.enum";

interface StatusHistoryAttributes {
  history_id: number;
  changed_at: Date;
  old_status: TicketStatus;
  new_status: TicketStatus;
  ticket_id: string; 
  changed_by_user_id: string; 
  createdAt?: Date;
  updatedAt?: Date;
}

type StatusHistoryCreationAttributes = Optional<
  StatusHistoryAttributes,
  "history_id" | "createdAt" | "updatedAt" | "changed_at"
>;

class StatusHistory
  extends Model<StatusHistoryAttributes, StatusHistoryCreationAttributes>
  implements StatusHistoryAttributes
{
  public history_id!: number;
  public changed_at!: Date;
  public old_status!: TicketStatus;
  public new_status!: TicketStatus;
  public ticket_id!: string;
  public changed_by_user_id!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: { [key: string]: ModelStatic<Model> }): void {
    StatusHistory.belongsTo(models.Ticket, {
      foreignKey: "ticket_id",
      as: "ticket",
      onDelete: "CASCADE",
    });
    StatusHistory.belongsTo(models.User, {
      foreignKey: "changed_by_user_id",
      as: "changedByUser",
      onDelete: "SET NULL", 
    });
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
      defaultValue: DataTypes.NOW, 
    },
    old_status: {
      type: DataTypes.ENUM(...Object.values(TicketStatus)),
      allowNull: false,
    },
    new_status: {
      type: DataTypes.ENUM(...Object.values(TicketStatus)),
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
    tableName: "status_histories",
    timestamps: true,
    indexes: [
      { fields: ["ticket_id"] },
      { fields: ["changed_by_user_id"] },
      { fields: ["changed_at"] },
    ],
  }
);

export default StatusHistory;
