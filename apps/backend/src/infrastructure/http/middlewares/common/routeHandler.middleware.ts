import { Request, Response, NextFunction } from 'express';

/**
 * Maneja las respuestas de las rutas envolviendo la lógica del controlador
 * @param {Function} handler - Función que maneja la lógica de la ruta y retorna una promesa
 * @returns {Function} Middleware que ejecuta el handler, responde al cliente y maneja errores
 */
export function routeHandler(
    handler: (req: Request) => Promise<{ status: number; data: any }> // Define que el handler recibe un Request y devuelve una promesa con cualquier tipo
  ) {
    // Devuelve una función middleware compatible con Express
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Ejecuta el handler y espera su resultado
        const result = await handler(req);

        if (!res.headersSent && result !== undefined) {
          const { status = 200, data } = result;
          res.status(status).json(data);
        }
      } catch (err) {
        // Si ocurre un error, lo pasa al middleware de manejo de errores de Express
        next(err);
      }
    };
  }
