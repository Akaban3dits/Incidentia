import { DataTypes, Model, Optional, ModelStatic } from "sequelize";
import { sequelize } from "../config/sequelize";

interface AttachmentAttributes {
  attachment_id: string; 
  file_path: string;
  uploaded_at: Date;
  is_image: boolean;
  original_filename: string;
  ticket_id: string; 
  createdAt?: Date;
  updatedAt?: Date;
}

type AttachmentCreationAttributes = Optional<
  AttachmentAttributes,
  "attachment_id" | "createdAt" | "updatedAt"
>;

class Attachment
  extends Model<AttachmentAttributes, AttachmentCreationAttributes>
  implements AttachmentAttributes
{
  public attachment_id!: string;
  public file_path!: string;
  public uploaded_at!: Date;
  public is_image!: boolean;
  public original_filename!: string;
  public ticket_id!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: { [key: string]: ModelStatic<Model> }): void {
    Attachment.belongsTo(models.Ticket, { foreignKey: "ticket_id" });
  }
}

Attachment.init(
  {
    attachment_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    file_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    uploaded_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_image: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    original_filename: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ticket_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "tickets",
        key: "ticket_id",
      },
    },
  },
  {
    sequelize,
    modelName: "Attachment",
    tableName: "attachments",
    timestamps: true,
  }
);

export default Attachment;
