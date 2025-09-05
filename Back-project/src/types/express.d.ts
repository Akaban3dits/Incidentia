import "express";
import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface User extends JwtPayload {
      user_id: string;
      name?: string;
      email?: string;
      role?: string;
    }
  }
}

export {};
