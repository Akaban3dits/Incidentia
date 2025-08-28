import { DataTypes, Model, Optional, ModelStatic } from "sequelize";
import { sequelize } from "../config/sequelize";

interface DeviceTypeAttributes {
  device_type_id: number;
  type_name: string;
  type_code?: string | null;
}

type DeviceTypeCreationAttributes = Optional<
  DeviceTypeAttributes,
  "device_type_id" | "type_code"
>;

class DeviceType
  extends Model<DeviceTypeAttributes, DeviceTypeCreationAttributes>
  implements DeviceTypeAttributes
{
  public device_type_id!: number;
  public type_name!: string;
  public type_code!: string | null;

  public static associate(models: { [key: string]: ModelStatic<Model> }): void {
    DeviceType.hasMany(models.Device, {
      foreignKey: "device_type_id",
      as: "devices",
    });
  }
}

DeviceType.init(
  {
    device_type_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    type_code: {
      type: DataTypes.STRING(3),
      unique: true,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "DeviceType",
    tableName: "device_types",
    timestamps: false,
  }
);

export default DeviceType;
