import { DataTypes, Model, Optional, ModelStatic } from "sequelize";
import { sequelize } from "../config/sequelize";

interface DepartmentAttributes {
  id: number;
  name: string;
}

type DepartmentCreationAttributes = Optional<DepartmentAttributes, "id">;

class Department
  extends Model<DepartmentAttributes, DepartmentCreationAttributes>
  implements DepartmentAttributes
{
  public id!: number;
  public name!: string;

  public static associate(models: { [key: string]: ModelStatic<Model> }): void {
    Department.hasMany(models.User, {
      foreignKey: "department_id",
      as: "users",
    });

    Department.hasMany(models.Ticket, {
      foreignKey: "department_id",
      as: "tickets",
    });
  }
}

Department.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "Department",
    tableName: "departments",
    timestamps: false,
  }
);

export default Department;
