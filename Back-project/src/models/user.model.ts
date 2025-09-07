import { DataTypes, Model, Optional, ModelStatic, Op } from "sequelize";
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
  company: CompanyType | null;
  role: UserRole;
  provider?: string | null;
  provider_id?: string | null;
  department_id?: number | null;
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
    User.belongsTo(models.Department, {
      foreignKey: "department_id",
      as: "department",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    User.hasMany(models.Ticket, {
      foreignKey: "assigned_user_id",
      as: "assignedTickets",
    });

    User.hasMany(models.Comment, {
      foreignKey: "user_id",
      as: "comments",
    });

    User.hasMany(models.StatusHistory, {
      foreignKey: "changed_by_user_id",
      as: "statusChanges",
    });

    if (models.Notification && models.NotificationUser) {
      User.belongsToMany(models.Notification, {
        through: models.NotificationUser,
        foreignKey: "user_id",
        otherKey: "notification_id",
        as: "notifications",
      });
    }
  }

  static initScopes() {
    User.addScope("active", {
      where: { status: UserStatus.Activo },
    });

    User.addScope("byDepartment", (department_id: number) => ({
      where: { department_id },
    }));

    User.addScope("byRole", (role: UserRole) => ({
      where: { role },
    }));

    User.addScope("byCompany", (company: CompanyType) => ({
      where: { company },
    }));

    User.addScope("byStatus", (status: UserStatus) => ({
      where: { status },
    }));

    User.addScope("search", (q: string) => ({
      where: {
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${q}%` } },
          { last_name: { [Op.iLike]: `%${q}%` } },
          { email: { [Op.iLike]: `%${q}%` } },
        ],
      },
    }));

    User.addScope("withPassword", {
      attributes: { include: ["password"] },
    });

    User.addScope("recent", {
      order: [["createdAt", "DESC"]],
    });
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
      allowNull: true,
    },
    company: {
      type: DataTypes.ENUM(...Object.values(CompanyType)),
      allowNull: true,
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
      references: { model: "departments", key: "id" },
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
    indexes: [
      { unique: true, fields: ["email"] },
      { unique: true, fields: ["provider", "provider_id"] },
      { fields: ["status"] },
      { fields: ["role"] },
      { fields: ["department_id"] },
      { fields: ["createdAt"] },
    ],
  }
);

(User as any).initScopes?.();

export default User;
