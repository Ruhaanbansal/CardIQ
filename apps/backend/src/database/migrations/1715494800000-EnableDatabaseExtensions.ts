import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnableDatabaseExtensions1715494800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
    
    // Attempt to install pgvector if supported by environment
    try {
      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "vector"`);
    } catch (e) {
      console.warn('pgvector extension not supported in this environment, skipping...');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP EXTENSION IF EXISTS "vector"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "pg_trgm"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "pgcrypto"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
