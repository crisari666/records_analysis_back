import { registerAs } from '@nestjs/config';

export default registerAs('bcrypt', () => ({
  rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
}));
