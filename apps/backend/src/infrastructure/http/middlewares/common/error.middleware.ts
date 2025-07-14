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
  error : any,
  req   : Request,
  res   : Response,
  _next  : NextFunction
) => {
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: error.message,
    name: error.name,
    stack: error.stack,
    code: error.code,
    errors: error.errors,
    originalError: error.originalError,
    validation: error.validation,
    ...(error.response ? { response: error.response } : {})
  });
  
  // Manejo de errores de validación de class-validator
  if (Array.isArray(error) && error[0] instanceof ValidationError) {
    const errors = error.map((err: ValidationError) => ({
      property: err.property,
      constraints: err.constraints,
      value: err.value,
      target: err.target,
      children: err.children,
    }));
    
    return res.status(400).json({
      status: 'error',
      message: 'Error de validación',
      error: 'VALIDATION_ERROR',
      details: errors,
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }

  // Manejo de errores de validación de Firebase
  if (error.code && error.code.startsWith('auth/')) {
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Error de autenticación',
      error: error.code || 'AUTH_ERROR',
      details: error.details || {},
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }

  // Manejo de errores de validación personalizados
  if (error.name === 'ValidationError' || error.name === 'ValidatorError') {
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Error de validación',
      error: error.name || 'VALIDATION_ERROR',
      details: error.errors || error.details || {},
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }

  // Manejo de HttpException personalizado
  if (error instanceof HttpException) {
    return res.status(error.status).json({
      status: 'error',
      message: error.message,
      error: error.name || 'HTTP_EXCEPTION',
      details: error.errors || {},
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }

  // Error no manejado
  const errorId = Math.random().toString(36).substring(2, 9);
  console.error(`[${new Date().toISOString()}] Unhandled Error ID: ${errorId}`, error);
  
  return res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
    error: 'INTERNAL_SERVER_ERROR',
    errorId,
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(process.env.NODE_ENV === 'development' ? {
      debug: {
        message: error.message,
        name: error.name,
        stack: error.stack,
      }
    } : {})
  });
};
