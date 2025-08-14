/**
 * Representa el perfil recibido desde la autenticación de Google.
 */
export interface GoogleProfile {
  id: string;
  emails?: { value: string }[];
  name?: { givenName: string; familyName: string };
}
