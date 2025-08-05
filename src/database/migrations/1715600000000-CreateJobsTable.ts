import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJobsTable1715600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create job_type enum
    await queryRunner.query(`
      CREATE TYPE "public"."jobs_jobtype_enum" AS ENUM('CLT', 'PJ', 'FREELANCER', 'INTERNSHIP', 'TEMPORARY')
    `);

    // Create work_model enum
    await queryRunner.query(`
      CREATE TYPE "public"."jobs_workmodel_enum" AS ENUM('ONSITE', 'REMOTE', 'HYBRID')
    `);

    // Create jobs table
    await queryRunner.query(`
      CREATE TABLE "jobs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "companyName" character varying NOT NULL,
        "location" character varying NOT NULL,
        "jobType" "public"."jobs_jobtype_enum" NOT NULL DEFAULT 'CLT',
        "workModel" "public"."jobs_workmodel_enum" NOT NULL DEFAULT 'ONSITE',
        "salaryMin" integer,
        "salaryMax" integer,
        "displaySalary" boolean NOT NULL DEFAULT true,
        "skills" text NOT NULL,
        "requirements" text NOT NULL,
        "benefits" text,
        "industry" character varying NOT NULL,
        "workHours" integer,
        "experienceYears" integer,
        "expiresAt" TIMESTAMP NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "vacancies" integer NOT NULL DEFAULT 1,
        "companyUserId" uuid NOT NULL,
        "viewCount" integer NOT NULL DEFAULT 0,
        "applicationCount" integer NOT NULL DEFAULT 0,
        "impressionCount" integer NOT NULL DEFAULT 0,
        "clickCount" integer NOT NULL DEFAULT 0,
        "saveCount" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_jobs" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "jobs" 
      ADD CONSTRAINT "FK_jobs_users" 
      FOREIGN KEY ("companyUserId") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_jobs_companyUserId" ON "jobs" ("companyUserId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_jobs_isActive" ON "jobs" ("isActive")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_jobs_jobType" ON "jobs" ("jobType")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_jobs_workModel" ON "jobs" ("workModel")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_jobs_location" ON "jobs" ("location")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_jobs_industry" ON "jobs" ("industry")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_jobs_expiresAt" ON "jobs" ("expiresAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_jobs_expiresAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_jobs_industry"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_jobs_location"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_jobs_workModel"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_jobs_jobType"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_jobs_isActive"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_jobs_companyUserId"`);

    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "jobs" DROP CONSTRAINT IF EXISTS "FK_jobs_users"
    `);

    // Drop jobs table
    await queryRunner.query(`DROP TABLE IF EXISTS "jobs"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."jobs_workmodel_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."jobs_jobtype_enum"`);
  }
}
