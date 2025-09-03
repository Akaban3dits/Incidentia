import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Application } from "express";
import path from "path";

const swaggerDefinition: swaggerJsdoc.SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Incidentia API",
    version: "2.1.0",
    description: "API para gestión de tickets y errores informáticos en Incidentia",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local",
    },
    {
      url: "https://incidentia.example.com",
      description: "Servidor de producción",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: [
    path.join(__dirname, "../routes/**/*.ts"),
    path.join(__dirname, "../controllers/**/*.ts"),
    path.join(__dirname, "../docs/**/*.ts"), 
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Application): void {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
