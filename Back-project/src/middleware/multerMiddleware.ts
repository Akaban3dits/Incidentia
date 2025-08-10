import { Request, Response, NextFunction } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import sharp from "sharp";

// Crea directorio recursivamente si no existe
const createDirectory = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
};

// Configura multer para guardar archivos en memoria (buffer)
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage }).single("image");

// Middleware que procesa la imagen subida, la convierte a webp y guarda en disco
const uploadSingleImageMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload(req, res, async (err: any) => {
    if (err) return next(err);       // Maneja errores de multer
    if (!req.file) return next();    // Si no hay archivo, sigue sin procesar

    try {
      // Obtiene fecha actual para organizar carpetas por año/mes/día
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const day = now.getDate().toString().padStart(2, "0");

      // Define ruta donde se guardará la imagen
      const uploadDir = path.join(__dirname, "../uploads", year, month, day);
      createDirectory(uploadDir);  // Crea carpetas si no existen

      // Genera nombre único para el archivo basado en fecha y código aleatorio
      const timestamp = `${year}${month}${day}`;
      const uniqueCode = `${timestamp}-${Math.random().toString(36).substring(2, 8)}`;
      const newFileName = `${uniqueCode}.webp`;
      const outputPath = path.join(uploadDir, newFileName);

      // Convierte la imagen a formato webp con calidad 80 y la guarda en disco
      await sharp(req.file.buffer)
        .webp({ quality: 80 })
        .toFile(outputPath);

      // Guarda la ruta relativa del archivo procesado para usar luego
      req.body.image_url = `/uploads/${year}/${month}/${day}/${newFileName}`;

      next(); // Continúa al siguiente middleware
    } catch (error) {
      next(error); // En caso de error, pasa al manejador de errores
    }
  });
};

export default uploadSingleImageMiddleware;
