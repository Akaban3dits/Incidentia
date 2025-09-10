import path from "path";
import dotenv from "dotenv";
import { initializeDatabase } from "../db/initializeDatabase";
import { sequelize } from "../config/sequelize";

import NotificationUser from "../models/notificationUser.model";
import Notification from "../models/notification.model";
import StatusHistory from "../models/statusHistory.model";
import Attachment from "../models/attachment.model";
import Comment from "../models/comment.model";
import Task from "../models/task.model";
import Ticket from "../models/ticket.model";
import Device from "../models/device.model";
import DeviceType from "../models/deviceType.model";
import User from "../models/user.model";
import Department from "../models/department.model";

import { clearCachedTokens } from "./auth/token";

process.env.NODE_ENV = "test";
dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });

beforeAll(async () => {
  await initializeDatabase();
});

async function truncateAll() {
  const qi = sequelize.getQueryInterface() as any;
  const qg = qi.queryGenerator;

  const models = [
    NotificationUser,
    Notification,
    StatusHistory,
    Attachment,
    Comment,
    Task,
    Ticket,
    Device,
    DeviceType,
    User,
    Department,
  ];

  const tables = models
    .filter((m) => m?.getTableName)
    .map((m) => qg.quoteTable(m.getTableName()));

  if (tables.length) {
    await sequelize.query(
      `TRUNCATE TABLE ${tables.join(", ")} RESTART IDENTITY CASCADE;`
    );
  }

  clearCachedTokens();
}

beforeEach(async () => {
  await truncateAll();
});

afterAll(async () => {
  await sequelize.close();
});
