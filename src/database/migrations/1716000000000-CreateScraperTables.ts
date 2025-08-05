import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateScraperTables1716000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create scraper_platform enum
    await queryRunner.query(`
      CREATE TYPE "public"."scraper_platform_enum" AS ENUM('LINKEDIN', 'INFOJOBS', 'CATHO', 'INDEED')
    `);

    // Create session_status enum
    await queryRunner.query(`
      CREATE TYPE "public"."session_status_enum" AS ENUM('ACTIVE', 'EXPIRED', 'INVALID', 'RATE_LIMITED')
    `);

    // Create scraper_sessions table
    await queryRunner.query(`
      CREATE TABLE "scraper_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        "platform" "public"."scraper_platform_enum" NOT NULL,
        "status" "public"."session_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "cookies" jsonb NOT NULL,
        "headers" jsonb,
        "userAgent" character varying,
        "proxyUrl" character varying,
        "requestCount" integer NOT NULL DEFAULT 0,
        "lastRequestAt" TIMESTAMP,
        "expiresAt" TIMESTAMP,
        "errorMessage" text,
        "isClientSide" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_scraper_sessions" PRIMARY KEY ("id")
      )
    `);

    // Create scraper_job_status enum
    await queryRunner.query(`
      CREATE TYPE "public"."scraper_job_status_enum" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')
    `);

    // Create scraper_jobs table
    await queryRunner.query(`
      CREATE TABLE "scraper_jobs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        "platform" "public"."scraper_platform_enum" NOT NULL,
        "status" "public"."scraper_job_status_enum" NOT NULL DEFAULT 'PENDING',
        "parameters" jsonb NOT NULL,
        "result" jsonb,
        "errorMessage" text,
        "startedAt" TIMESTAMP,
        "completedAt" TIMESTAMP,
        "retryCount" integer NOT NULL DEFAULT 0,
        "nextRetryAt" TIMESTAMP,
        "isAutoApply" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_scraper_jobs" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "scraper_sessions" 
      ADD CONSTRAINT "FK_scraper_sessions_users" 
      FOREIGN KEY ("userId") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "scraper_jobs" 
      ADD CONSTRAINT "FK_scraper_jobs_users" 
      FOREIGN KEY ("userId") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_scraper_sessions_userId" ON "scraper_sessions" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_scraper_sessions_platform" ON "scraper_sessions" ("platform")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_scraper_sessions_status" ON "scraper_sessions" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_scraper_sessions_expiresAt" ON "scraper_sessions" ("expiresAt")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_scraper_jobs_userId" ON "scraper_jobs" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_scraper_jobs_platform" ON "scraper_jobs" ("platform")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_scraper_jobs_status" ON "scraper_jobs" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_scraper_jobs_isAutoApply" ON "scraper_jobs" ("isAutoApply")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_scraper_jobs_nextRetryAt" ON "scraper_jobs" ("nextRetryAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_scraper_jobs_nextRetryAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_scraper_jobs_isAutoApply"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_scraper_jobs_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_scraper_jobs_platform"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_scraper_jobs_userId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_scraper_sessions_expiresAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_scraper_sessions_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_scraper_sessions_platform"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_scraper_sessions_userId"`);

    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "scraper_jobs" DROP CONSTRAINT IF EXISTS "FK_scraper_jobs_users"
    `);

    await queryRunner.query(`
      ALTER TABLE "scraper_sessions" DROP CONSTRAINT IF EXISTS "FK_scraper_sessions_users"
    `);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "scraper_jobs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "scraper_sessions"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."scraper_job_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."session_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."scraper_platform_enum"`);
  }
}
