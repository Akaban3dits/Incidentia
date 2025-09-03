import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import sharp from "sharp";
import crypto from "crypto";
import { BadRequestError } from "../utils/error";

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
}).single("file");

export const uploadAttachment = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, async (err: any) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new BadRequestError("El archivo no puede superar 20MB"));
      }
      return next(new BadRequestError(err.message || "Error al subir el archivo"));
    }

    if (!req.file) return next();

    try {
      const file = req.file;
      const now = new Date();
      const year = String(now.getFullYear());
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");

      const destDir = path.join(process.cwd(), "uploads", year, month, day);
      ensureDir(destDir);

      const unique = crypto.randomBytes(8).toString("hex");
      const isImage = file.mimetype.startsWith("image/");

      let fileName: string;
      let absPath: string;

      if (isImage) {
        fileName = `${unique}.webp`;
        absPath = path.join(destDir, fileName);
        await sharp(file.buffer).webp({ quality: 80 }).toFile(absPath);
      } else {
        const origExt = path.extname(file.originalname) || "";
        fileName = `${unique}${origExt}`;
        absPath = path.join(destDir, fileName);
        fs.writeFileSync(absPath, file.buffer);
      }

      const publicPath = `/uploads/${year}/${month}/${day}/${fileName}`;

      req.body.file_path = publicPath;
      req.body.original_filename = file.originalname;
      req.body.is_image = isImage;
      if (!req.body.uploaded_at) req.body.uploaded_at = now.toISOString();

      if (req.body.ticket_id === "") req.body.ticket_id = null;
      if (req.body.comment_id === "") req.body.comment_id = null;

      return next();
    } catch (e: any) {
      return next(new BadRequestError(e?.message || "Error al procesar el archivo"));
    }
  });
};

export default uploadAttachment;
