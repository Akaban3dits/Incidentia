import { DataTypes, Model, Optional, ModelStatic } from "sequelize";
import { sequelize } from "../config/sequelize";

interface DepartmentAttributes {
  department_id: number;
  department_name: string;
}

type DepartmentCreationAttributes = Optional<DepartmentAttributes, "department_id">;

class Department
  extends Model<DepartmentAttributes, DepartmentCreationAttributes>
  implements DepartmentAttributes
{
  public department_id!: number;
  public department_name!: string;

}

Department.init(
  {
    department_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    department_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
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
