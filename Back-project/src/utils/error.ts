export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;     // Código HTTP asociado al error
    this.name = this.constructor.name; // Nombre de la clase para identificación
  }
}

// 400 - Solicitud incorrecta
export class BadRequestError extends AppError {
  constructor(message = "Solicitud incorrecta") {
    super(message, 400);
  }
}

// 401 - No autenticado
export class UnauthorizedError extends AppError {
  constructor(message = "No autenticado") {
    super(message, 401);
  }
}

// 402 - Pago requerido
export class PaymentRequiredError extends AppError {
  constructor(message = "Pago requerido") {
    super(message, 402);
  }
}

// 403 - Prohibido
export class ForbiddenError extends AppError {
  constructor(message = "Acceso prohibido") {
    super(message, 403);
  }
}

// 404 - No encontrado
export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404);
  }
}

// 405 - Método no permitido
export class MethodNotAllowedError extends AppError {
  constructor(message = "Método HTTP no permitido") {
    super(message, 405);
  }
}

// 406 - No aceptable
export class NotAcceptableError extends AppError {
  constructor(message = "Formato de respuesta no aceptable") {
    super(message, 406);
  }
}

// 408 - Tiempo de espera agotado
export class RequestTimeoutError extends AppError {
  constructor(message = "Tiempo de espera agotado") {
    super(message, 408);
  }
}

// 409 - Conflicto
export class ConflictError extends AppError {
  constructor(message = "Conflicto con datos existentes") {
    super(message, 409);
  }
}

// 410 - Recurso eliminado
export class GoneError extends AppError {
  constructor(message = "Recurso ya no disponible") {
    super(message, 410);
  }
}

// 411 - Longitud requerida
export class LengthRequiredError extends AppError {
  constructor(message = "Longitud de contenido requerida") {
    super(message, 411);
  }
}

// 412 - Precondición fallida
export class PreconditionFailedError extends AppError {
  constructor(message = "Precondición fallida") {
    super(message, 412);
  }
}

// 413 - Payload demasiado grande
export class PayloadTooLargeError extends AppError {
  constructor(message = "El cuerpo de la petición es demasiado grande") {
    super(message, 413);
  }
}

// 415 - Tipo de medio no soportado
export class UnsupportedMediaTypeError extends AppError {
  constructor(message = "Tipo de medio no soportado") {
    super(message, 415);
  }
}

// 422 - Entidad no procesable
export class UnprocessableEntityError extends AppError {
  constructor(message = "La entidad enviada no puede ser procesada") {
    super(message, 422);
  }
}

// 429 - Demasiadas solicitudes
export class TooManyRequestsError extends AppError {
  constructor(message = "Demasiadas solicitudes, intente más tarde") {
    super(message, 429);
  }
}

// 500 - Error interno del servidor
export class InternalServerError extends AppError {
  constructor(message = "Error interno del servidor") {
    super(message, 500);
  }
}

// 501 - No implementado
export class NotImplementedError extends AppError {
  constructor(message = "Funcionalidad no implementada") {
    super(message, 501);
  }
}

// 502 - Bad Gateway
export class BadGatewayError extends AppError {
  constructor(message = "Error en la pasarela") {
    super(message, 502);
  }
}

// 503 - Servicio no disponible
export class ServiceUnavailableError extends AppError {
  constructor(message = "Servicio no disponible") {
    super(message, 503);
  }
}

// 504 - Gateway Timeout
export class GatewayTimeoutError extends AppError {
  constructor(message = "Tiempo de espera de la pasarela agotado") {
    super(message, 504);
  }
}

// 507 - Almacenamiento insuficiente
export class InsufficientStorageError extends AppError {
  constructor(message = "Almacenamiento insuficiente en el servidor") {
    super(message, 507);
  }
}

