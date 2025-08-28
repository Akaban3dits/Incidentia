import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { AppError } from "../utils/error";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const logsDir = path.join(__dirname, "..", "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const logFile = path.join(
    logsDir,
    `${new Date().toISOString().slice(0, 10)}.log`
  );

  const logMessage = `[${new Date().toISOString()}] ${req.method} ${
    req.originalUrl
  }\nMensaje: ${err.message}\nStack: ${err.stack || "No stack"}\n\n`;

  fs.appendFileSync(logFile, logMessage, "utf-8");
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  return res.status(500).json({
    error: "InternalServerError",
    message: "Error interno del servidor",
  });
};

export default errorHandler;
