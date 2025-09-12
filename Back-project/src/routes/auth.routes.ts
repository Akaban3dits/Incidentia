import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { loginValidator } from "../validators/auth.validator";
import { validationResultMiddleware } from "../middleware/validationMiddleware";

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Inicio de sesión con email y contraseña
 *     description: >
 *       Permite autenticar a un usuario usando sus credenciales (email y contraseña).  
 *       Si las credenciales son correctas, genera un token JWT que incluye la información básica del usuario
 *       y el estado de `isCompleteProfile`.
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@ejemplo.com
 *                 description: Email del usuario registrado.
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "MiC0ntraseñaSegura!"
 *                 description: Contraseña del usuario.
 *     responses:
 *       200:
 *         description: Autenticación exitosa, devuelve token JWT y datos del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación en la aplicación.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID del usuario.
 *                     email:
 *                       type: string
 *                       description: Email del usuario.
 *                     role:
 *                       type: string
 *                       description: Rol del usuario.
 *                     isCompleteProfile:
 *                       type: boolean
 *                       description: Indica si el perfil del usuario está completo.
 *       400:
 *         description: Email o contraseña faltante o inválida.
 *       401:
 *         description: Credenciales incorrectas.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/login", loginValidator, validationResultMiddleware, AuthController.login);

/**
 * @openapi
 * /auth/google:
 *   get:
 *     summary: Inicia la autenticación con Google
 *     description: >
 *       Redirige al usuario a la página de login de Google para autenticación OAuth2.
 *       Este endpoint inicia el flujo OAuth2 usando el cliente configurado en la aplicación.
 *     tags:
 *       - Autenticación
 *     responses:
 *       302:
 *         description: Redirección a Google para autenticación.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html>Redirecting...</html>"
 *       400:
 *         description: Solicitud incorrecta.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/google", (req, res, next) => {
  AuthController.googleAuth(req, res, next);
});

/**
 * @openapi
 * /auth/google/callback:
 *   get:
 *     summary: Callback de autenticación de Google
 *     description: >
 *       Endpoint que recibe la respuesta de Google tras intentar autenticar al usuario.
 *       Intercambia el código de autorización por un token de acceso y genera un JWT interno.
 *     tags:
 *       - Autenticación
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Código de autorización devuelto por Google.
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         required: false
 *         description: Estado enviado en la solicitud original (opcional).
 *     responses:
 *       200:
 *         description: Autenticación exitosa, token JWT generado.
 *       401:
 *         description: Autenticación fallida o código inválido.
 *       400:
 *         description: Parámetros faltantes o inválidos.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/google/callback", (req, res, next) => {
  AuthController.googleAuthCallback(req, res, next);
});

/**
 * @openapi
 * /auth/google/admin:
 *   get:
 *     summary: Autenticación de administrador con Google
 *     description: >
 *       Inicia el flujo OAuth2 de Google para crear un usuario administrador.
 *       Solo debe ser usado para inicializar un administrador en la aplicación.
 *     tags:
 *       - Autenticación
 *     responses:
 *       302:
 *         description: Redirección a Google para autenticación del admin.
 *       400:
 *         description: Solicitud incorrecta.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/google/admin", (req, res, next) => {
  AuthController.googleAdminAuth(req, res, next);
});

/**
 * @openapi
 * /auth/google/admin/callback:
 *   get:
 *     summary: Callback de autenticación de administrador
 *     description: >
 *       Endpoint que recibe la respuesta de Google tras autenticar al administrador.
 *       Si es exitoso, crea un usuario con rol Administrador y retorna un token JWT.
 *       Este endpoint debe ser usado únicamente para crear el primer admin.
 *     tags:
 *       - Autenticación
 *     responses:
 *       200:
 *         description: Administrador creado exitosamente, token JWT generado.
 *       401:
 *         description: Autenticación fallida o código inválido.
 *       400:
 *         description: Parámetros faltantes o inválidos.
 *       409:
 *         description: Ya existe un usuario administrador en la aplicación.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/google/admin/callback", (req, res, next) => {
  AuthController.googleAdminAuthCallback(req, res, next);
});

export default router;
