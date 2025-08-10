import { ModelStatic, Model } from "sequelize";

import Department from "./department.model";
import DeviceType from "./deviceType.model";
import User from "./user.model";
import Device from "./device.model";
import Ticket from "./ticket.model";
import Comment from "./comment.model";
import Attachment from "./attachment.model";
import StatusHistory from "./statusHistory.model";
import Task from "./task.model";
import Notification from "./notification.model";
import NotificationUser from "./notificationUser.model";

const models: { [key: string]: ModelStatic<Model> & { associate?: (models: any) => void } } = {
  Department,
  DeviceType,
  User,
  Device,
  Ticket,
  Comment,
  Attachment,
  StatusHistory,
  Task,
  Notification,
  NotificationUser,
};

export const associateModels = () => {
  Object.values(models).forEach((model) => {
    if (typeof model.associate === "function") {
      model.associate(models);
    }
  });
};

export default models;
