export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;     
    this.name = this.constructor.name; 
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Solicitud incorrecta") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autenticado") {
    super(message, 401);
  }
}

export class PaymentRequiredError extends AppError {
  constructor(message = "Pago requerido") {
    super(message, 402);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acceso prohibido") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404);
  }
}

export class MethodNotAllowedError extends AppError {
  constructor(message = "Método HTTP no permitido") {
    super(message, 405);
  }
}

export class NotAcceptableError extends AppError {
  constructor(message = "Formato de respuesta no aceptable") {
    super(message, 406);
  }
}

export class RequestTimeoutError extends AppError {
  constructor(message = "Tiempo de espera agotado") {
    super(message, 408);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicto con datos existentes") {
    super(message, 409);
  }
}

export class GoneError extends AppError {
  constructor(message = "Recurso ya no disponible") {
    super(message, 410);
  }
}

export class LengthRequiredError extends AppError {
  constructor(message = "Longitud de contenido requerida") {
    super(message, 411);
  }
}

export class PreconditionFailedError extends AppError {
  constructor(message = "Precondición fallida") {
    super(message, 412);
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = "El cuerpo de la petición es demasiado grande") {
    super(message, 413);
  }
}

export class UnsupportedMediaTypeError extends AppError {
  constructor(message = "Tipo de medio no soportado") {
    super(message, 415);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = "La entidad enviada no puede ser procesada") {
    super(message, 422);
  }
}
export class TooManyRequestsError extends AppError {
  constructor(message = "Demasiadas solicitudes, intente más tarde") {
    super(message, 429);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Error interno del servidor") {
    super(message, 500);
  }
}

export class NotImplementedError extends AppError {
  constructor(message = "Funcionalidad no implementada") {
    super(message, 501);
  }
}

export class BadGatewayError extends AppError {
  constructor(message = "Error en la pasarela") {
    super(message, 502);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Servicio no disponible") {
    super(message, 503);
  }
}

export class GatewayTimeoutError extends AppError {
  constructor(message = "Tiempo de espera de la pasarela agotado") {
    super(message, 504);
  }
}

export class InsufficientStorageError extends AppError {
  constructor(message = "Almacenamiento insuficiente en el servidor") {
    super(message, 507);
  }
}

