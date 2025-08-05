import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPreferences1715500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add email notifications preference
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "emailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT TRUE
    `);

    // Add push notifications preference
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "pushNotificationsEnabled" BOOLEAN NOT NULL DEFAULT TRUE
    `);

    // Add profile visibility preference
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "profileVisible" BOOLEAN NOT NULL DEFAULT TRUE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove profile visibility preference
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "profileVisible"
    `);

    // Remove push notifications preference
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "pushNotificationsEnabled"
    `);

    // Remove email notifications preference
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "emailNotificationsEnabled"
    `);
  }
}
