import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
    migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
    synchronize: false, // Strict migration control
    migrationsRun: true,
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
};
