import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import sharp from "sharp";
import crypto from "crypto";

/**
 * Crea un directorio recursivamente si no existe.
 * @param folderPath Ruta completa del directorio
 */
const createDirectory = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

/**
 * Configuración de multer para almacenamiento en memoria.
 * - Permite procesar la imagen antes de guardarla en disco.
 * - Incluye validación de tipo MIME y límite de tamaño.
 */
const multerStorage = multer.memoryStorage();

// Filtro de archivos: solo acepta imágenes
const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Solo se permiten archivos de imagen"));
  }
  cb(null, true);
};

// Instancia de multer con límites y filtro
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single("image");

/**
 * Middleware que procesa la imagen subida:
 * 1. Recibe la imagen en memoria con multer.
 * 2. Valida que sea realmente una imagen y no exceda tamaño máximo.
 * 3. Crea carpetas por año/mes/día para organización.
 * 4. Genera un nombre único seguro usando `crypto`.
 * 5. Convierte la imagen a formato WebP con calidad 80 usando Sharp.
 * 6. Guarda la ruta relativa en `req.body.image_url` para uso posterior.
 * 7. Pasa al siguiente middleware o controlador.
 */
const uploadSingleImageMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload(req, res, async (err: any) => {
    if (err) return next(err);     // Maneja errores de multer (tipo/size)
    if (!req.file) return next();  // Si no hay archivo, sigue sin procesar

    try {
      // Fecha actual para organizar carpetas
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const day = now.getDate().toString().padStart(2, "0");

      // Ruta completa para guardar la imagen
      const uploadDir = path.join(__dirname, "../uploads", year, month, day);
      createDirectory(uploadDir);

      // Nombre único seguro para evitar colisiones y ataques
      const uniqueCode = crypto.randomBytes(6).toString("hex");
      const newFileName = `${uniqueCode}.webp`;
      const outputPath = path.join(uploadDir, newFileName);

      // Convierte a WebP con calidad 80 y guarda en disco
      await sharp(req.file.buffer).webp({ quality: 80 }).toFile(outputPath);

      // Ruta relativa para almacenar en base de datos o usar en respuesta
      req.body.image_url = `/uploads/${year}/${month}/${day}/${newFileName}`;

      next(); // Continua al siguiente middleware/controlador
    } catch (error) {
      next(error); // Pasa errores a manejador global
    }
  });
};

export default uploadSingleImageMiddleware;
