import { DataTypes, Model, Optional, ModelStatic } from "sequelize";
import { sequelize } from "../config/sequelize";
import { UserRole } from "../enums/userRole.enum";
import { UserStatus } from "../enums/userStatus.enum";
import { CompanyType } from "../enums/companyType.enum";

interface UserAttributes {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  password?: string | null;
  phone_number?: string | null;
  status: UserStatus;
  company: CompanyType;
  role: UserRole;
  provider?: string | null;
  provider_id?: string | null;
  department_id?: number | null;   // FK -> departments.id
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<
  UserAttributes,
  | "user_id"
  | "createdAt"
  | "updatedAt"
  | "password"
  | "phone_number"
  | "provider"
  | "provider_id"
  | "department_id"
>;

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public user_id!: string;
  public first_name!: string;
  public last_name!: string;
  public email!: string;
  public password!: string | null;
  public phone_number!: string | null;
  public status!: UserStatus;
  public company!: CompanyType;
  public role!: UserRole;
  public provider!: string | null;
  public provider_id!: string | null;
  public department_id!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: { [key: string]: ModelStatic<Model> }): void {
    User.belongsTo(models.Department, { foreignKey: "department_id" });
  }
}

User.init(
  {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(UserStatus)),
      allowNull: false,
    },
    company: {
      type: DataTypes.ENUM(...Object.values(CompanyType)),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    provider_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "departments",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["provider", "provider_id"] },
    ],
  }
);

export default User;
