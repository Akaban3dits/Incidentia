import { DataTypes, Model, Optional, ModelStatic } from "sequelize";
import { sequelize } from "../config/sequelize";

interface CommentAttributes {
  comment_id: string; // UUID
  comment_text: string;
  ticket_id: string; // FK UUID Ticket
  user_id: string; // FK UUID User
  parent_comment_id?: string | null; // FK UUID Comment
  createdAt?: Date;
  updatedAt?: Date;
}

type CommentCreationAttributes = Optional<CommentAttributes, "comment_id" | "parent_comment_id" | "createdAt" | "updatedAt">;

class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public comment_id!: string;
  public comment_text!: string;
  public ticket_id!: string;
  public user_id!: string;
  public parent_comment_id!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: { [key: string]: ModelStatic<Model> }): void {
    Comment.belongsTo(models.Ticket, { foreignKey: "ticket_id" });
    Comment.belongsTo(models.User, { foreignKey: "user_id" });
    Comment.belongsTo(models.Comment, { foreignKey: "parent_comment_id", as: "parentComment" });
    Comment.hasMany(models.Comment, { foreignKey: "parent_comment_id", as: "childComments" });
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
      references: {
        model: "tickets",
        key: "ticket_id",
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    parent_comment_id: {
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
    modelName: "Comment",
    tableName: "comments",
    timestamps: true,
  }
);

export default Comment;
