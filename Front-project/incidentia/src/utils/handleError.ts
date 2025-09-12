import { AxiosError } from "axios";

export function handleThunkError(err: unknown, fallback = "Error inesperado") {
  if (err instanceof AxiosError) {
    return err.response?.data?.message || fallback;
  }
  return fallback;
}
