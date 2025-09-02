import { NotificationType } from "../enums/notificationType.enum";

export interface CreateNotificationInput {
  type: NotificationType;
  message: string;
  ticket_id?: string | null;        
  recipients: string[];             
}

export interface ListNotificationsParams {
  ticketId?: string;
  type?: NotificationType;
  search?: string;
  from?: Date | string;             
  to?: Date | string;
  limit?: number;
  offset?: number;
  sort?: "createdAt" | "updatedAt" | "notification_id";
  order?: "ASC" | "DESC";
}

export interface ListUserNotificationsParams {
  userId: string;                   
  unreadOnly?: boolean;
  hidden?: boolean;
  type?: NotificationType;
  ticketId?: string;
  from?: Date | string;
  to?: Date | string;
  limit?: number;
  offset?: number;
  sort?: "createdAt" | "updatedAt" | "notification_id";
  order?: "ASC" | "DESC";
}
