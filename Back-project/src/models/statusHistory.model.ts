import {
  DataTypes,
  Model,
  Optional,
  ModelStatic,
  Op,
  FindOptions,
  Order,
} from "sequelize";
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

const ORDERABLE_COLUMNS = ["changed_at", "createdAt", "updatedAt"] as const;
export type StatusHistoryOrderableCol = typeof ORDERABLE_COLUMNS[number];

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

  static initScopes() {
    StatusHistory.addScope(
      "byTicket",
      (ticket_id: string): FindOptions<StatusHistoryAttributes> => ({
        where: { ticket_id },
      })
    );

    StatusHistory.addScope(
      "byUser",
      (user_id: string): FindOptions<StatusHistoryAttributes> => ({
        where: { changed_by_user_id: user_id },
      })
    );

    StatusHistory.addScope(
      "between",
      (
        from?: Date | string | null,
        to?: Date | string | null
      ): FindOptions<StatusHistoryAttributes> => {
        if (!from && !to) return {};
        const where: any = {};
        where.changed_at = {};
        if (from) where.changed_at[Op.gte] = from;
        if (to) where.changed_at[Op.lte] = to;
        return { where };
      }
    );

    StatusHistory.addScope(
      "oldStatus",
      (s: TicketStatus): FindOptions<StatusHistoryAttributes> => ({
        where: { old_status: s },
      })
    );

    StatusHistory.addScope(
      "newStatus",
      (s: TicketStatus): FindOptions<StatusHistoryAttributes> => ({
        where: { new_status: s },
      })
    );

    StatusHistory.addScope(
      "transition",
      (
        from: TicketStatus,
        to: TicketStatus
      ): FindOptions<StatusHistoryAttributes> => ({
        where: { old_status: from, new_status: to },
      })
    );

    StatusHistory.addScope("recent", {
      order: [["changed_at", "DESC"]] as Order,
    });

    StatusHistory.addScope(
      "orderBy",
      (
        col: StatusHistoryOrderableCol,
        dir: "ASC" | "DESC" = "ASC"
      ): FindOptions<StatusHistoryAttributes> => ({
        order: [[col, dir]] as Order,
      })
    );

    StatusHistory.addScope("withTicket", {
      include: [{ model: sequelize.models.Ticket, as: "ticket" }],
    });

    StatusHistory.addScope("withChangedByUser", {
      include: [{ model: sequelize.models.User, as: "changedByUser" }],
    });

    StatusHistory.addScope("withRelations", {
      include: [
        { model: sequelize.models.Ticket, as: "ticket" },
        { model: sequelize.models.User, as: "changedByUser" },
      ],
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

StatusHistory.initScopes?.();

export default StatusHistory;
export { ORDERABLE_COLUMNS };
