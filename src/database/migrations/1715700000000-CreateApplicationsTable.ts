import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateApplicationsTable1715700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create application_status enum
    await queryRunner.query(`
      CREATE TYPE "public"."applications_status_enum" AS ENUM('PENDING', 'REVIEWING', 'INTERVIEW', 'REJECTED', 'ACCEPTED')
    `);

    // Create applications table
    await queryRunner.query(`
      CREATE TABLE "applications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        "jobId" uuid NOT NULL,
        "status" "public"."applications_status_enum" NOT NULL DEFAULT 'PENDING',
        "coverLetter" text,
        "resumeUrl" character varying,
        "notes" text,
        "isRead" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_applications" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "applications" 
      ADD CONSTRAINT "FK_applications_users" 
      FOREIGN KEY ("userId") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "applications" 
      ADD CONSTRAINT "FK_applications_jobs" 
      FOREIGN KEY ("jobId") 
      REFERENCES "jobs"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    // Create unique constraint to prevent duplicate applications
    await queryRunner.query(`
      ALTER TABLE "applications"
      ADD CONSTRAINT "UQ_applications_userId_jobId" UNIQUE ("userId", "jobId")
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_applications_userId" ON "applications" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_applications_jobId" ON "applications" ("jobId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_applications_status" ON "applications" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_applications_isRead" ON "applications" ("isRead")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_applications_isRead"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_applications_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_applications_jobId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_applications_userId"`);

    // Drop unique constraint
    await queryRunner.query(`
      ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "UQ_applications_userId_jobId"
    `);

    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "FK_applications_jobs"
    `);

    await queryRunner.query(`
      ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "FK_applications_users"
    `);

    // Drop applications table
    await queryRunner.query(`DROP TABLE IF EXISTS "applications"`);

    // Drop enum
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."applications_status_enum"`);
  }
}
