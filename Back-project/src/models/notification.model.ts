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

const ORDERABLE_COLUMNS = ["createdAt", "updatedAt", "notification_id"] as const;
export type NotificationOrderableCol = typeof ORDERABLE_COLUMNS[number];

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
    Notification.addScope(
      "byType",
      (type: NotificationType): FindOptions<NotificationAttributes> => ({
        where: { type },
      })
    );

    Notification.addScope(
      "byTicket",
      (ticket_id: string): FindOptions<NotificationAttributes> => ({
        where: { ticket_id },
      })
    );

    Notification.addScope(
      "searchMessage",
      (q: string): FindOptions<NotificationAttributes> => ({
        where: { message: { [Op.iLike]: `%${q}%` } },
      })
    );

    Notification.addScope(
      "betweenCreated",
      (
        from?: Date | string | null,
        to?: Date | string | null
      ): FindOptions<NotificationAttributes> => {
        if (!from && !to) return {};
        const where: any = {};
        where.createdAt = {};
        if (from) where.createdAt[Op.gte] = from;
        if (to) where.createdAt[Op.lte] = to;
        return { where };
      }
    );

    Notification.addScope(
      "orderBy",
      (
        col: NotificationOrderableCol,
        dir: "ASC" | "DESC" = "DESC"
      ): FindOptions<NotificationAttributes> => ({
        order: [[col, dir]] as Order,
      })
    );

    Notification.addScope("recent", {
      order: [["createdAt", "DESC"]] as Order,
    });
    Notification.addScope("withRecipients", {
      include: [{ model: sequelize.models.User, as: "recipients" }],
    });

    Notification.addScope("withTicket", {
      include: [{ model: sequelize.models.Ticket, as: "ticket" }],
    });

    Notification.addScope("withRelations", {
      include: [
        { model: sequelize.models.User, as: "recipients" },
        { model: sequelize.models.Ticket, as: "ticket" },
      ],
    });

    Notification.addScope(
      "forRecipient",
      (
        userId: string,
        unreadOnly = false,
        hidden: boolean | undefined = undefined
      ): FindOptions<NotificationAttributes> => ({
        include: [
          {
            model: sequelize.models.User,
            as: "recipients",
            through: {
              where: {
                user_id: userId,
                ...(unreadOnly ? { read_at: null } : {}),
                ...(typeof hidden === "boolean" ? { hidden } : {}),
              },
            },
            required: true,
          },
        ],
      })
    );
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
export { ORDERABLE_COLUMNS };
