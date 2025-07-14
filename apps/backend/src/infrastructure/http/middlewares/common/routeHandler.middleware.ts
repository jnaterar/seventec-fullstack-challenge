import { Request, Response, NextFunction } from 'express';

type HandlerWithReq = (req: Request) => Promise<{ status: number; data: any }>;
type HandlerWithReqRes = (req: Request, res: Response) => Promise<void>;
type Handler = HandlerWithReq | HandlerWithReqRes;

/**
 * Maneja las respuestas de las rutas envolviendo la lógica del controlador
 * @param {Function} handler - Función que maneja la lógica de la ruta
 * @returns {Function} Middleware que ejecuta el handler, responde al cliente y maneja errores
 */
export function routeHandler(handler: Handler) {
  // Devuelve una función middleware compatible con Express
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Determinar si el handler espera solo req o req y res
      if (handler.length <= 1) {
        // Handler que devuelve { status, data }
        const result = await (handler as HandlerWithReq)(req);
        
        if (!res.headersSent && result !== undefined) {
          const { status = 200, data } = result;
          return res.status(status).json(data);
        }
      } else {
        // Handler que maneja la respuesta directamente con res
        await (handler as HandlerWithReqRes)(req, res);
      }
    } catch (err) {
      // Si ocurre un error, lo pasa al middleware de manejo de errores de Express
      next(err);
    }
  };
}
