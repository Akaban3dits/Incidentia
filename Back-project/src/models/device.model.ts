import { DataTypes, Model, Optional, ModelStatic } from "sequelize";
import { sequelize } from "../config/sequelize";

interface DeviceAttributes {
  device_id: number;
  device_name: string;
  device_type_id: number;
}

type DeviceCreationAttributes = Optional<DeviceAttributes, "device_id">;

class Device extends Model<DeviceAttributes, DeviceCreationAttributes> implements DeviceAttributes {
  public device_id!: number;
  public device_name!: string;
  public device_type_id!: number;

  public static associate(models: { [key: string]: ModelStatic<Model> }): void {
    Device.belongsTo(models.DeviceType, { foreignKey: "device_type_id" });
  }
}

Device.init(
  {
    device_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    device_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    device_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "device_type",
        key: "device_type_id",
      },
    },
  },
  {
    sequelize,
    modelName: "Device",
    tableName: "devices",
    timestamps: false,
  }
);

export default Device;
