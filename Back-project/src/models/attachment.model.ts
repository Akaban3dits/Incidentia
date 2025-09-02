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

interface AttachmentAttributes {
  attachment_id: string;
  file_path: string;
  uploaded_at: Date;
  is_image: boolean;
  original_filename: string;
  ticket_id?: string | null;
  comment_id?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type AttachmentCreationAttributes = Optional<
  AttachmentAttributes,
  "attachment_id" | "ticket_id" | "comment_id" | "createdAt" | "updatedAt"
>;

const ORDERABLE_COLS = ["uploaded_at", "createdAt", "original_filename"] as const;
type OrderableCol = typeof ORDERABLE_COLS[number];

class Attachment
  extends Model<AttachmentAttributes, AttachmentCreationAttributes>
  implements AttachmentAttributes
{
  public attachment_id!: string;
  public file_path!: string;
  public uploaded_at!: Date;
  public is_image!: boolean;
  public original_filename!: string;
  public ticket_id!: string | null;
  public comment_id!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: { [key: string]: ModelStatic<Model> }): void {
    Attachment.belongsTo(models.Ticket, {
      foreignKey: "ticket_id",
      as: "ticket",
      onDelete: "CASCADE",
    });
    Attachment.belongsTo(models.Comment, {
      foreignKey: "comment_id",
      as: "comment",
      onDelete: "CASCADE",
    });
  }

  static initScopes() {
    Attachment.addScope(
      "byTicket",
      (ticket_id: string): FindOptions<AttachmentAttributes> => ({
        where: { ticket_id },
      })
    );

    Attachment.addScope(
      "byComment",
      (comment_id: string): FindOptions<AttachmentAttributes> => ({
        where: { comment_id },
      })
    );

    Attachment.addScope(
      "isImage",
      (flag: boolean): FindOptions<AttachmentAttributes> => ({
        where: { is_image: !!flag },
      })
    );

    Attachment.addScope(
      "uploadedBetween",
      (from?: Date | string, to?: Date | string): FindOptions<AttachmentAttributes> => {
        const where: any = {};
        if (from || to) {
          where.uploaded_at = {};
          if (from) where.uploaded_at[Op.gte] = from;
          if (to) where.uploaded_at[Op.lte] = to;
        }
        return { where };
      }
    );

    Attachment.addScope(
      "search",
      (q: string): FindOptions<AttachmentAttributes> => ({
        where: {
          [Op.or]: [
            { original_filename: { [Op.iLike]: `%${q}%` } },
            { file_path: { [Op.iLike]: `%${q}%` } },
          ],
        },
      })
    );

    Attachment.addScope(
      "orderBy",
      (col: OrderableCol, dir: "ASC" | "DESC" = "DESC"): FindOptions => ({
        order: [[col, dir]] as Order,
      })
    );

    Attachment.addScope("withTicket", {
      include: [{ model: sequelize.models.Ticket, as: "ticket" }],
    });

    Attachment.addScope("withComment", {
      include: [{ model: sequelize.models.Comment, as: "comment" }],
    });
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
      allowNull: true,
      references: {
        model: "tickets",
        key: "ticket_id",
      },
    },
    comment_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "comments",
        key: "comment_id",
      },
    },
  },
  {
    sequelize,
    modelName: "Attachment",
    tableName: "attachments",
    timestamps: true,
    indexes: [
      { fields: ["ticket_id"] },
      { fields: ["comment_id"] },
      { fields: ["uploaded_at"] },
      { fields: ["is_image"] },
      { fields: ["createdAt"] },
    ],
    validate: {
      ticketOrCommentExclusive(this: Attachment) {
        const hasTicket = !!this.ticket_id;
        const hasComment = !!this.comment_id;
        if ((hasTicket && hasComment) || (!hasTicket && !hasComment)) {
          throw new Error(
            "El adjunto debe asociarse exactamente a un ticket O a un comentario (exclusivo)."
          );
        }
      },
    },
  }
);

Attachment.initScopes?.();

export default Attachment;
