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

interface CommentAttributes {
  comment_id: string;
  comment_text: string;
  ticket_id: string;
  user_id: string;
  parent_comment_id?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type CommentCreationAttributes = Optional<
  CommentAttributes,
  "comment_id" | "parent_comment_id" | "createdAt" | "updatedAt"
>;

const ORDERABLE_COLUMNS = ["createdAt", "updatedAt"] as const;
type CommentOrderableCol = typeof ORDERABLE_COLUMNS[number];

class Comment
  extends Model<CommentAttributes, CommentCreationAttributes>
  implements CommentAttributes
{
  public comment_id!: string;
  public comment_text!: string;
  public ticket_id!: string;
  public user_id!: string;
  public parent_comment_id!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: { [key: string]: ModelStatic<Model> }): void {
    Comment.belongsTo(models.Ticket, {
      foreignKey: "ticket_id",
      as: "ticket",
      onDelete: "CASCADE",
    });
    Comment.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "author",
      onDelete: "RESTRICT",
    });
    Comment.belongsTo(models.Comment, {
      foreignKey: "parent_comment_id",
      as: "parentComment",
      onDelete: "CASCADE",
    });
    Comment.hasMany(models.Comment, {
      foreignKey: "parent_comment_id",
      as: "childComments",
    });

    if (models.Attachment) {
      Comment.hasMany(models.Attachment, { foreignKey: "comment_id", as: "attachments" });
    }
  }

  static initScopes() {
    Comment.addScope(
      "byTicket",
      (ticket_id: string): FindOptions<CommentAttributes> => ({
        where: { ticket_id },
      })
    );

    Comment.addScope(
      "byUser",
      (user_id: string): FindOptions<CommentAttributes> => ({
        where: { user_id },
      })
    );

    Comment.addScope("topLevel", {
        where: { parent_comment_id: null },
    });

    Comment.addScope(
      "byParent",
      (parent_comment_id: string): FindOptions<CommentAttributes> => ({
        where: { parent_comment_id },
      })
    );

    Comment.addScope(
      "search",
      (q: string): FindOptions<CommentAttributes> => ({
        where: { comment_text: { [Op.iLike]: `%${q}%` } },
      })
    );

    Comment.addScope(
      "orderBy",
      (col: CommentOrderableCol, dir: "ASC" | "DESC" = "ASC"): FindOptions => ({
        order: [[col, dir]] as Order,
      })
    );

    Comment.addScope("withAuthor", {
      include: [{ model: sequelize.models.User, as: "author" }],
    });

    Comment.addScope("withTicket", {
      include: [{ model: sequelize.models.Ticket, as: "ticket" }],
    });
  }
}

Comment.init(
  {
    comment_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    comment_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ticket_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "tickets", key: "ticket_id" },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "user_id" },
    },
    parent_comment_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "comments", key: "comment_id" },
    },
  },
  {
    sequelize,
    modelName: "Comment",
    tableName: "comments",
    timestamps: true,
    indexes: [
      { fields: ["ticket_id"] },
      { fields: ["user_id"] },
      { fields: ["parent_comment_id"] },
      { fields: ["createdAt"] },
    ],
  }
);

Comment.initScopes?.();

export default Comment;
