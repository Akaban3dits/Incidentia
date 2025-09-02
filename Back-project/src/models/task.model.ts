import { DataTypes, Model, Optional, ModelStatic } from "sequelize";
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

export default Task;
