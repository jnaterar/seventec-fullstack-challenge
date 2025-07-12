/**
 * Error personalizado para solicitudes incorrectas (400)
 */
export class BadRequestError extends Error {
  public statusCode : number;
  public errors     : string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    this.name       = 'BadRequestError';
    this.statusCode = 400;
    this.errors     = errors;
    
    // Mantener el stack trace en V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BadRequestError);
    }
  }

  /**
   * Convierte el error a un formato de respuesta
   */
  toJSON() {
    return {
      name       : this.name,
      message    : this.message,
      statusCode : this.statusCode,
      errors     : this.errors.length > 0 ? this.errors : undefined,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
}
