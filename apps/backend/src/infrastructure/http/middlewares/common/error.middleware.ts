import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'class-validator';

export class HttpException extends Error {
  constructor(public status: number, message: string, public errors?: any) {
    super(message);
    this.name = 'HttpException';
  }
}

// Middleware para manejo de errores globales
export const errorHandler = (
  error : Error,
  req   : Request,
  res   : Response,
  next  : NextFunction
) => {
  console.error(`[${new Date().toISOString()}] Error: ${error.message}`);
  
  if (error instanceof HttpException) {
    return res.status(error.status).json({
      status  : 'error',
      message : error.message,
      errors  : error.errors,
    });
  }

  // Manejo de errores de validación
  if (Array.isArray(error) && error[0] instanceof ValidationError) {
    const errors = error.map((err: ValidationError) => ({
      property    : err.property,
      constraints : err.constraints,
    }));
    
    return res.status(400).json({
      status  : 'error',
      message : 'Validación fallida',
      errors,
    });
  }

  // Error no manejado
  return res.status(500).json({
    status  : 'error',
    message : 'Error interno del servidor',
  });
};
