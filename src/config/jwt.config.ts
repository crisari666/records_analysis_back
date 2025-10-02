import { registerAs } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export default registerAs('jwt', () => {
  const privateKeyPath = path.join(process.cwd(), 'jwt-private.pem');
  const publicKeyPath = path.join(process.cwd(), 'jwt-public.pem');
  
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

  return {
    privateKey,
    publicKey,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    algorithm: 'RS256',
  };
});
