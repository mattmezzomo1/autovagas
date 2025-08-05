import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAutoApplyTables1715800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create auto_apply_configs table
    await queryRunner.query(`
      CREATE TABLE "auto_apply_configs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        "isEnabled" boolean NOT NULL DEFAULT false,
        "keywords" text,
        "locations" text,
        "industries" text,
        "excludedKeywords" text,
        "excludedCompanies" text,
        "jobTypes" text,
        "workModels" text,
        "salaryMin" integer,
        "experienceMax" integer,
        "matchThreshold" integer NOT NULL DEFAULT 5,
        "maxApplicationsPerDay" integer NOT NULL DEFAULT 10,
        "maxApplicationsPerMonth" integer NOT NULL DEFAULT 50,
        "applicationsToday" integer NOT NULL DEFAULT 0,
        "applicationsThisMonth" integer NOT NULL DEFAULT 0,
        "lastResetDay" DATE,
        "lastResetMonth" DATE,
        "defaultCoverLetter" text,
        "defaultResumeUrl" character varying,
        CONSTRAINT "PK_auto_apply_configs" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_auto_apply_configs_userId" UNIQUE ("userId")
      )
    `);

    // Create auto_apply_status enum
    await queryRunner.query(`
      CREATE TYPE "public"."auto_apply_history_status_enum" AS ENUM('SUCCESS', 'FAILED', 'SKIPPED')
    `);

    // Create auto_apply_reason enum
    await queryRunner.query(`
      CREATE TYPE "public"."auto_apply_history_reason_enum" AS ENUM('APPLIED', 'ALREADY_APPLIED', 'LOW_MATCH', 'EXCLUDED_KEYWORD', 'EXCLUDED_COMPANY', 'LIMIT_REACHED', 'ERROR')
    `);

    // Create auto_apply_history table
    await queryRunner.query(`
      CREATE TABLE "auto_apply_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        "jobId" uuid,
        "status" "public"."auto_apply_history_status_enum" NOT NULL DEFAULT 'SUCCESS',
        "reason" "public"."auto_apply_history_reason_enum" NOT NULL DEFAULT 'APPLIED',
        "matchScore" integer,
        "details" text,
        "applicationId" uuid,
        CONSTRAINT "PK_auto_apply_history" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "auto_apply_configs" 
      ADD CONSTRAINT "FK_auto_apply_configs_users" 
      FOREIGN KEY ("userId") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "auto_apply_history" 
      ADD CONSTRAINT "FK_auto_apply_history_users" 
      FOREIGN KEY ("userId") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "auto_apply_history" 
      ADD CONSTRAINT "FK_auto_apply_history_jobs" 
      FOREIGN KEY ("jobId") 
      REFERENCES "jobs"("id") 
      ON DELETE SET NULL 
      ON UPDATE NO ACTION
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_auto_apply_configs_userId" ON "auto_apply_configs" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_auto_apply_configs_isEnabled" ON "auto_apply_configs" ("isEnabled")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_auto_apply_history_userId" ON "auto_apply_history" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_auto_apply_history_jobId" ON "auto_apply_history" ("jobId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_auto_apply_history_status" ON "auto_apply_history" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_auto_apply_history_reason" ON "auto_apply_history" ("reason")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_auto_apply_history_createdAt" ON "auto_apply_history" ("createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_auto_apply_history_createdAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_auto_apply_history_reason"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_auto_apply_history_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_auto_apply_history_jobId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_auto_apply_history_userId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_auto_apply_configs_isEnabled"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_auto_apply_configs_userId"`);

    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "auto_apply_history" DROP CONSTRAINT IF EXISTS "FK_auto_apply_history_jobs"
    `);

    await queryRunner.query(`
      ALTER TABLE "auto_apply_history" DROP CONSTRAINT IF EXISTS "FK_auto_apply_history_users"
    `);

    await queryRunner.query(`
      ALTER TABLE "auto_apply_configs" DROP CONSTRAINT IF EXISTS "FK_auto_apply_configs_users"
    `);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "auto_apply_history"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auto_apply_configs"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."auto_apply_history_reason_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."auto_apply_history_status_enum"`);
  }
}
