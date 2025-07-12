import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@backend/config';
import { UserRole } from '@backend/core/domain/enums/user-role.enum';
import { AuthUserPayload } from '@backend/infrastructure/http/dtos/user.dto';

const payload : AuthUserPayload = {
  id    : '1',
  email : 'jhonder.natera@gmail.com',
  roles : [UserRole.ADMIN]
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
console.log('Token:', token);
