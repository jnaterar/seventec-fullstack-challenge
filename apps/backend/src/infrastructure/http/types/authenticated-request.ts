import { AuthUserPayload } from '@backend/infrastructure/http/dtos/user.dto';
import { Request } from 'express';
import { ParsedQs } from 'qs';
import { ParamsDictionary } from 'express-serve-static-core';

/**
 * Extensión del Request de Express que incluye el usuario autenticado
 */
export interface AuthenticatedRequest extends Request<ParamsDictionary, any, any, ParsedQs> {
  user: AuthUserPayload;
}
