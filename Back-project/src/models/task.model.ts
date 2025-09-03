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

interface TaskAttributes {
  task_id: number;
  task_description: string;
  is_completed: boolean;
  ticket_id: string;
  completed_at?: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}

type TaskCreationAttributes = Optional<
  TaskAttributes,
  "task_id" | "createdAt" | "updatedAt" | "completed_at"
>;

const ORDERABLE_COLUMNS = [
  "createdAt",
  "updatedAt",
  "completed_at",
  "task_description",
  "is_completed",
] as const;
export type TaskOrderableCol = typeof ORDERABLE_COLUMNS[number];

class Task
  extends Model<TaskAttributes, TaskCreationAttributes>
  implements TaskAttributes
{
  public task_id!: number;
  public task_description!: string;
  public is_completed!: boolean;
  public ticket_id!: string;
  public completed_at!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: { [key: string]: ModelStatic<Model> }): void {
    Task.belongsTo(models.Ticket, {
      foreignKey: "ticket_id",
      as: "ticket",
      onDelete: "CASCADE",
    });
  }

  static initScopes() {
    Task.addScope("byTicket", (ticket_id: string): FindOptions<TaskAttributes> => ({
      where: { ticket_id },
    }));

    Task.addScope(
      "completed",
      (value = true): FindOptions<TaskAttributes> => ({
        where: { is_completed: !!value },
      })
    );

    Task.addScope(
      "search",
      (q: string): FindOptions<TaskAttributes> => {
        const s = q?.trim();
        if (!s) return {};
        return { where: { task_description: { [Op.iLike]: `%${s}%` } } };
      }
    );

    Task.addScope(
      "completedBetween",
      (from?: Date | string | null, to?: Date | string | null): FindOptions<TaskAttributes> => {
        if (!from && !to) return {};
        const where: any = {};
        where.completed_at = {};
        if (from) where.completed_at[Op.gte] = from;
        if (to) where.completed_at[Op.lte] = to;
        return { where };
      }
    );

    Task.addScope("recent", {
      order: [["createdAt", "DESC"]] as Order,
    });

    Task.addScope(
      "orderBy",
      (col: TaskOrderableCol, dir: "ASC" | "DESC" = "ASC"): FindOptions<TaskAttributes> => ({
        order: [[col, dir]] as Order,
      })
    );

    Task.addScope("withTicket", {
      include: [{ model: sequelize.models.Ticket, as: "ticket" }],
    });
  }
}

Task.init(
  {
    task_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    task_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    ticket_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "tickets",
        key: "ticket_id",
      },
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Task",
    tableName: "tasks",
    timestamps: true,
    indexes: [
      { fields: ["ticket_id"] },
      { fields: ["is_completed"] },
      { fields: ["createdAt"] },
    ],
  }
);

Task.initScopes?.();

export default Task;
export { ORDERABLE_COLUMNS };
