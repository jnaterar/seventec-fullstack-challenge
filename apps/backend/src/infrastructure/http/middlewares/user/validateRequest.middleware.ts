import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BadRequestError } from '@backend/infrastructure/http/errors/bad-request.error';

/**
 * Middleware para validar los datos de la petición usando class-validator
 * @param type Clase DTO a validar
 * @param property Propiedad de la petición a validar (body, query, params)
 */
export function validateRequest(type: any, property: 'body' | 'query' | 'params' = 'body') {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Convertir el objeto plano a una instancia de la clase
      const dto = plainToInstance(type, req[property]);
      
      // Validar el objeto
      const errors = await validate(dto, { 
        whitelist             : true,
        forbidNonWhitelisted  : true,
        validationError       : { target: false }
      });

      // Si hay errores, devolver un error 400
      if (errors.length > 0) {
        const errorMessages = errors.flatMap(error => 
          Object.values(error.constraints || {})
        );
        
        throw new BadRequestError('Validación fallida', errorMessages);
      }

      // Reemplazar el objeto original con el validado (sin propiedades no deseadas)
      req[property] = dto;
      
      next();
      
    } catch (error) {
      next(error);
    }
  };
}
