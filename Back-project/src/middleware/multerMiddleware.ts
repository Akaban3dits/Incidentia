import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import sharp from "sharp";
import crypto from "crypto";
import { BadRequestError } from "../utils/error";

const createDirectory = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

const multerStorage = multer.memoryStorage();

const multerFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new BadRequestError("Solo se permiten archivos de imagen"));
  }
  cb(null, true);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single("image");

const uploadSingleImageMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload(req, res, async (err: any) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new BadRequestError("La imagen no puede superar 5MB"));
      }
      return next(new BadRequestError(err.message));
    }

    if (!req.file) return next();

    try {
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const day = now.getDate().toString().padStart(2, "0");

      const uploadDir = path.join(process.cwd(), "uploads", year, month, day);
      createDirectory(uploadDir);

      const uniqueCode = crypto.randomBytes(6).toString("hex");
      const newFileName = `${uniqueCode}.webp`;
      const outputPath = path.join(uploadDir, newFileName);

      await sharp(req.file.buffer).webp({ quality: 80 }).toFile(outputPath);

      req.body.image_url = `/uploads/${year}/${month}/${day}/${newFileName}`;

      next();
    } catch (error) {
      next(error);
    }
  });
};

export default uploadSingleImageMiddleware;
