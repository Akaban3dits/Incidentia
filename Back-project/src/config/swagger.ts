import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Application } from "express";
import path from 'path';

// Define la estructura general de la documentación Swagger
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Incidentia",
    version: "2.1.0",
    description:
      "Documentación de API para Incidentia, aplicación basada en gestión de errores informáticos",
  },
  servers: [
    {
      url: "http://localhost:3000/api", // URL base de la API
      description: "Servidor local",
    },
  ],
};

// Configura las rutas donde buscar anotaciones Swagger (`@swagger`)
const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  apis: [
    path.join(__dirname, '../routes/**/*.ts'),       // Archivos de rutas
    path.join(__dirname, '../controllers/**/*.ts'),  // Archivos de controladores
  ],
};

const swaggerSpec = swaggerJsdoc(options);

// Registra Swagger UI en la ruta /api-docs
export function setupSwagger(app: Application) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
