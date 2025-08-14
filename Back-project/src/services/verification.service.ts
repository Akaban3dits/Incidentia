import admin from "../config/firebase";

interface VerificationSession {
  [phone: string]: string;
}

// Simula almacenamiento temporal de códigos (para pruebas)
const verificationSessions: VerificationSession = {};

/**
 * Envía un código de verificación al teléfono (simulado).
 * El SMS real debe enviarse desde frontend con Firebase SDK.
 */
export function sendVerificationCode(phone: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationSessions[phone] = code;

  console.log(`Código generado para ${phone}: ${code}`); // Solo para desarrollo

  return { success: true, message: "Código enviado (simulado)" };
}

/**
 * Verifica el código ingresado por el usuario
 */
export function verifyCode(phone: string, code: string) {
  const record = verificationSessions[phone];
  if (!record) return { success: false, message: "No se envió código a este número" };
  if (record !== code) return { success: false, message: "Código incorrecto" };

  delete verificationSessions[phone]; // Evita reutilización
  return { success: true, message: "Número verificado correctamente" };
}

/**
 * Verifica un token de Firebase real (generado por frontend)
 */
export async function verifyFirebaseToken(idToken: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return { success: true, uid: decodedToken.uid };
  } catch (error) {
    return { success: false, message: "Token inválido", error };
  }
}
