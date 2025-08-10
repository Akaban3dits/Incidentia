import { Request, Response } from 'express';
import * as verificationService from '../services/verification.service';

// Controlador para enviar un código de verificación a un número de teléfono
export async function sendCode(req: Request, res: Response) {
  const { phone } = req.body;
  try {
    await verificationService.sendVerificationCode(phone); // Llama al servicio para enviar el código
    res.json({ success: true, message: 'Código enviado' }); // Respuesta exitosa
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al enviar código', error }); // Manejo de errores
  }
}

// Controlador para verificar si el código ingresado es válido
export function verifyCode(req: Request, res: Response) {
  const { phone, code } = req.body;
  const result = verificationService.verifyCode(phone, code); // Verifica el código ingresado

  if (!result.success) {
    return res.status(400).json(result); // Código incorrecto o expirado
  }

  res.json(result); // Código válido
}
