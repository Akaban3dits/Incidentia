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

interface DeviceTypeAttributes {
  device_type_id: number;
  type_name: string;
  type_code?: string | null;
}

type DeviceTypeCreationAttributes = Optional<
  DeviceTypeAttributes,
  "device_type_id" | "type_code"
>;

const ORDERABLE_COLUMNS = ["type_name", "type_code"] as const;
export type DeviceTypeOrderableCol = typeof ORDERABLE_COLUMNS[number];

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

  static initScopes() {
    DeviceType.addScope(
      "byName",
      (name: string): FindOptions<DeviceTypeAttributes> => ({
        where: { type_name: name },
      })
    );

    DeviceType.addScope(
      "byCode",
      (code: string): FindOptions<DeviceTypeAttributes> => ({
        where: { type_code: code },
      })
    );

    DeviceType.addScope(
      "search",
      (q: string): FindOptions<DeviceTypeAttributes> => ({
        where: {
          [Op.or]: [
            { type_name: { [Op.iLike]: `%${q}%` } },
            { type_code: { [Op.iLike]: `%${q}%` } },
          ],
        },
      })
    );

    DeviceType.addScope(
      "orderBy",
      (col: DeviceTypeOrderableCol, dir: "ASC" | "DESC" = "ASC"): FindOptions =>
        ({ order: [[col, dir]] as Order })
    );

    DeviceType.addScope("withDevices", {
      include: [{ model: sequelize.models.Device, as: "devices" }],
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
    indexes: [
      { unique: true, fields: ["type_name"] },
      { unique: true, fields: ["type_code"] },
    ],
  }
);

DeviceType.initScopes?.();

export default DeviceType;
