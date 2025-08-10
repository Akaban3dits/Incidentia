import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

/**
 * @openapi
 * /api/auth/google:
 *   get:
 *     summary: Inicia la autenticación con Google
 *     description: Redirige al usuario a la página de login de Google para autenticación OAuth2.
 *     tags:
 *       - Autenticación
 *     responses:
 *       302:
 *         description: Redirección a Google para autenticación
 */
router.get("/google", (req, res, next) => {
  AuthController.googleAuth(req, res, next);
});

/**
 * @openapi
 * /api/auth/google/callback:
 *   get:
 *     summary: Callback de autenticación de Google
 *     description: Endpoint que recibe la respuesta de Google tras intentar autenticar al usuario.
 *     tags:
 *       - Autenticación
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Código de autorización devuelto por Google
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Estado enviado en la solicitud original
 *     responses:
 *       200:
 *         description: Autenticación exitosa, token JWT generado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID del usuario
 *                     email:
 *                       type: string
 *                       description: Email del usuario
 *                     role:
 *                       type: string
 *                       description: Rol del usuario
 *       401:
 *         description: Autenticación fallida
 *       500:
 *         description: Error interno del servidor
 */
router.get("/google/callback", (req, res, next) => {
  AuthController.googleAuthCallback(req, res, next);
});


router.get("/google/admin", (req, res, next) => {
  AuthController.googleAdminAuth(req, res, next);
});

router.get("/google/admin/callback", (req, res, next) => {
  AuthController.googleAdminAuthCallback(req, res, next);
});


export default router;
