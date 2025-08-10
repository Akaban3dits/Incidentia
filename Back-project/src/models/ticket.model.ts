import { DataTypes, Model, Optional, ModelStatic } from "sequelize";
import { sequelize } from "../config/sequelize";
import { TicketStatus } from "../enums/ticketStatus.enum";
import { TicketPriority } from "../enums/ticketPriority.enum";

interface TicketAttributes {
  ticket_id: string; // UUID
  closed_at?: Date | null;
  titulo: string;
  description: string;
  status: TicketStatus;
  priority?: TicketPriority | null;
  device_id?: number | null;
  assigned_user_id?: string | null; 
  department_id: number;
  parent_ticket_id?: string | null; 
  createdAt?: Date;
  updatedAt?: Date;
}

type TicketCreationAttributes = Optional<
  TicketAttributes,
  | "ticket_id"
  | "closed_at"
  | "priority"
  | "device_id"
  | "assigned_user_id"
  | "parent_ticket_id"
  | "createdAt"
  | "updatedAt"
>;

class Ticket
  extends Model<TicketAttributes, TicketCreationAttributes>
  implements TicketAttributes
{
  public ticket_id!: string;
  public closed_at!: Date | null;
  public titulo!: string;
  public description!: string;
  public status!: TicketStatus;
  public priority!: TicketPriority | null;
  public device_id!: number | null;
  public assigned_user_id!: string | null;
  public department_id!: number;
  public parent_ticket_id!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: { [key: string]: ModelStatic<Model> }): void {
    Ticket.belongsTo(models.Device, { foreignKey: "device_id" });
    Ticket.belongsTo(models.User, { foreignKey: "assigned_user_id", as: "assignedUser" });
    Ticket.belongsTo(models.Department, { foreignKey: "department_id" });
    Ticket.belongsTo(models.Ticket, { foreignKey: "parent_ticket_id", as: "parentTicket" });
    Ticket.hasMany(models.Comment, { foreignKey: "ticket_id" });
    Ticket.hasMany(models.StatusHistory, { foreignKey: "ticket_id" });
    Ticket.hasMany(models.Task, { foreignKey: "ticket_id" });
    Ticket.hasMany(models.Attachment, { foreignKey: "ticket_id" });
    Ticket.hasMany(models.Notification, { foreignKey: "ticket_id" });
  }
}

Ticket.init(
  {
    ticket_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    titulo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TicketStatus)),
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM(...Object.values(TicketPriority)),
      allowNull: true,
    },
    device_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "devices",
        key: "device_id",
      },
    },
    assigned_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "departments",
        key: "department_id",
      },
    },
    parent_ticket_id: {
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
    modelName: "Ticket",
    tableName: "tickets",
    timestamps: true,
  }
);

export default Ticket;
