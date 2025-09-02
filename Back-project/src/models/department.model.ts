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

interface DepartmentAttributes {
  id: number;
  name: string;
}

type DepartmentCreationAttributes = Optional<DepartmentAttributes, "id">;

const ORDERABLE_COLUMNS = ["name", "id"] as const;
type DeptOrderableCol = typeof ORDERABLE_COLUMNS[number];

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

  static initScopes() {
    Department.addScope(
      "search",
      (q: string): FindOptions<DepartmentAttributes> => ({
        where: { name: { [Op.iLike]: `%${q}%` } },
      })
    );

    Department.addScope(
      "orderBy",
      (col: DeptOrderableCol, dir: "ASC" | "DESC" = "ASC"): FindOptions => ({
        order: [[col, dir]] as Order,
      })
    );

    Department.addScope("withUsers", {
      include: [{ model: sequelize.models.User, as: "users" }],
    });

    Department.addScope("withTickets", {
      include: [{ model: sequelize.models.Ticket, as: "tickets" }],
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
    indexes: [{ unique: true, fields: ["name"] }],
  }
);

Department.initScopes?.();

export default Department;
