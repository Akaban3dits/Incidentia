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

interface DeviceAttributes {
  device_id: number;
  device_name: string;
  device_type_id: number;
}

type DeviceCreationAttributes = Optional<DeviceAttributes, "device_id">;

const ORDERABLE_COLUMNS = ["device_name", "device_id"] as const;
type DeviceOrderableCol = typeof ORDERABLE_COLUMNS[number];

class Device
  extends Model<DeviceAttributes, DeviceCreationAttributes>
  implements DeviceAttributes
{
  public device_id!: number;
  public device_name!: string;
  public device_type_id!: number;

  public static associate(models: { [key: string]: ModelStatic<Model> }): void {
    Device.belongsTo(models.DeviceType, {
      foreignKey: "device_type_id",
      as: "deviceType",
    });

    Device.hasMany(models.Ticket, {
      foreignKey: "device_id",
      as: "tickets",
    });
  }

  static initScopes() {
    Device.addScope(
      "byTypeId",
      (device_type_id: number): FindOptions<DeviceAttributes> => ({
        where: { device_type_id },
      })
    );

    Device.addScope(
      "search",
      (q: string): FindOptions<DeviceAttributes> => ({
        where: { device_name: { [Op.iLike]: `%${q}%` } },
      })
    );

    Device.addScope(
      "orderBy",
      (col: DeviceOrderableCol, dir: "ASC" | "DESC" = "ASC"): FindOptions => ({
        order: [[col, dir]] as Order,
      })
    );

    Device.addScope("withType", {
      include: [{ model: sequelize.models.DeviceType, as: "deviceType" }],
    });
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
        model: "device_types",
        key: "device_type_id",
      },
    },
  },
  {
    sequelize,
    modelName: "Device",
    tableName: "devices",
    timestamps: false,
    indexes: [
      { fields: ["device_type_id"] },
      { fields: ["device_name"] },
    ],
  }
);

Device.initScopes?.();

export default Device;
