import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri:`mongodb://${process.env.DATABASE_USER}:${process.env.DATABASE_PASS}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`,
  uri_ws:`mongodb://${process.env.DB_WS_USER}:${process.env.DB_WS_PASS}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DB_WS_NAME}`,
  host: process.env.DATABASE_HOST || 'not_defined',
  port: parseInt(process.env.DATABASE_PORT || 'not_defined', 10),
  database: process.env.DATABASE_NAME || 'not_defined',
  username: process.env.DATABASE_USER || 'not_defined',
  password: process.env.DATABASE_PASS || 'not_defined',
  database_ws_user: process.env.DB_WS_USER || 'not_defined',
  database_ws_db: process.env.DB_WS_NAME || 'not_defined',
  database_ws_pass: process.env.DB_WS_PASS || 'not_defined',
}));
