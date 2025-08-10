import twilio from 'twilio';

const accountSid = process.env.TWILIO_SID!;            // SID de Twilio desde env
const authToken = process.env.TWILIO_AUTH_TOKEN!;      // Token de Twilio desde env
const client = twilio(accountSid, authToken);

// Objeto en memoria para guardar códigos y expiración por teléfono
const verificationCodes: Record<string, { code: string; expires: number }> = {};

// Envía un código de verificación SMS al número dado
export async function sendVerificationCode(phone: string) {
  // Genera un código numérico aleatorio de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  // Guarda código y tiempo de expiración (5 minutos) en memoria
  verificationCodes[phone] = { code, expires: Date.now() + 5 * 60 * 1000 };

  // Envía el SMS usando Twilio
  await client.messages.create({
    body: `Tu código de verificación es: ${code}`,
    from: process.env.TWILIO_PHONE_NUMBER!,  // Número configurado en Twilio
    to: phone,
  });
}

// Verifica que el código proporcionado sea válido y no expirado para ese teléfono
export function verifyCode(phone: string, code: string) {
  const record = verificationCodes[phone];
  if (!record) return { success: false, message: 'No se envió código a este número' };

  if (record.expires < Date.now()) {
    delete verificationCodes[phone];  // Elimina código expirado
    return { success: false, message: 'El código expiró' };
  }

  if (record.code !== code) return { success: false, message: 'Código incorrecto' }; 

  delete verificationCodes[phone];  // Código válido, elimina para no reutilizar
  return { success: true, message: 'Número verificado correctamente' };
}
