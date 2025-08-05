import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table
    await queryRunner.query(`
      CREATE TYPE "public"."users_role_enum" AS ENUM('candidate', 'company', 'admin');
      CREATE TYPE "public"."users_subscriptionplan_enum" AS ENUM('basic', 'plus', 'premium');
      
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "email" character varying NOT NULL,
        "fullName" character varying NOT NULL,
        "password" character varying NOT NULL,
        "phone" character varying,
        "location" character varying,
        "title" character varying,
        "experience" integer,
        "skills" text,
        "bio" text,
        "profileImage" character varying,
        "portfolioUrl" character varying,
        "linkedinUrl" character varying,
        "githubUrl" character varying,
        "jobTypes" text,
        "workModels" text,
        "salaryExpectationMin" integer,
        "salaryExpectationMax" integer,
        "industries" text,
        "locations" text,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'candidate',
        "subscriptionPlan" "public"."users_subscriptionplan_enum" NOT NULL DEFAULT 'basic',
        "credits" integer NOT NULL DEFAULT 10,
        "autoApplyEnabled" boolean NOT NULL DEFAULT false,
        "stripeCustomerId" character varying,
        "stripeSubscriptionId" character varying,
        "refreshToken" character varying,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      );
    `);

    // Companies table
    await queryRunner.query(`
      CREATE TYPE "public"."companies_size_enum" AS ENUM('micro', 'small', 'medium', 'large', 'enterprise');
      
      CREATE TABLE "companies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "name" character varying NOT NULL,
        "description" text NOT NULL,
        "logo" character varying,
        "website" character varying,
        "industry" character varying NOT NULL,
        "size" "public"."companies_size_enum" NOT NULL DEFAULT 'small',
        "location" character varying NOT NULL,
        "foundingYear" integer,
        "linkedinUrl" character varying,
        "benefits" text,
        "culture" text,
        "userId" uuid NOT NULL,
        CONSTRAINT "REL_companies_userId" UNIQUE ("userId"),
        CONSTRAINT "PK_companies" PRIMARY KEY ("id")
      );
    `);

    // Documents table
    await queryRunner.query(`
      CREATE TYPE "public"."documents_type_enum" AS ENUM('resume', 'cover_letter', 'portfolio', 'certificate', 'other');
      
      CREATE TABLE "documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "name" character varying NOT NULL,
        "type" "public"."documents_type_enum" NOT NULL DEFAULT 'other',
        "path" character varying NOT NULL,
        "mimeType" character varying NOT NULL,
        "size" integer NOT NULL,
        "isGeneratedByAi" boolean NOT NULL DEFAULT false,
        "metadata" jsonb,
        "userId" uuid NOT NULL,
        CONSTRAINT "PK_documents" PRIMARY KEY ("id")
      );
    `);

    // Jobs table
    await queryRunner.query(`
      CREATE TYPE "public"."jobs_jobtype_enum" AS ENUM('CLT', 'PJ', 'FREELANCER', 'INTERNSHIP', 'TEMPORARY');
      CREATE TYPE "public"."jobs_workmodel_enum" AS ENUM('ONSITE', 'REMOTE', 'HYBRID');
      
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
        CONSTRAINT "PK_jobs" PRIMARY KEY ("id")
      );
    `);

    // Applications table
    await queryRunner.query(`
      CREATE TYPE "public"."applications_status_enum" AS ENUM('pending', 'reviewing', 'interview', 'offer', 'rejected', 'accepted', 'withdrawn');
      CREATE TYPE "public"."applications_source_enum" AS ENUM('manual', 'auto_apply', 'linkedin', 'infojobs', 'catho');
      
      CREATE TABLE "applications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "status" "public"."applications_status_enum" NOT NULL DEFAULT 'pending',
        "source" "public"."applications_source_enum" NOT NULL DEFAULT 'manual',
        "coverLetter" text,
        "resumePath" character varying,
        "answers" jsonb,
        "matchScore" integer,
        "candidateNotes" text,
        "companyNotes" text,
        "externalApplicationId" character varying,
        "externalApplicationUrl" character varying,
        "userId" uuid NOT NULL,
        "jobId" uuid NOT NULL,
        CONSTRAINT "PK_applications" PRIMARY KEY ("id")
      );
    `);

    // Auto Apply Configs table
    await queryRunner.query(`
      CREATE TABLE "auto_apply_configs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "keywords" text,
        "locations" text NOT NULL,
        "remote" boolean NOT NULL DEFAULT true,
        "jobTypes" text NOT NULL,
        "workModels" text NOT NULL,
        "salaryMin" integer,
        "workHours" integer NOT NULL DEFAULT 40,
        "internationalJobs" boolean NOT NULL DEFAULT false,
        "experienceLevel" character varying,
        "industries" text,
        "matchThreshold" integer NOT NULL DEFAULT 70,
        "maxApplicationsPerDay" integer NOT NULL DEFAULT 10,
        "runInterval" integer NOT NULL DEFAULT 3600000,
        "headless" boolean NOT NULL DEFAULT true,
        "linkedinUsername" character varying,
        "linkedinPassword" character varying,
        "infojobsUsername" character varying,
        "infojobsPassword" character varying,
        "cathoUsername" character varying,
        "cathoPassword" character varying,
        "lastRunDate" TIMESTAMP,
        "todayApplicationCount" integer NOT NULL DEFAULT 0,
        "userId" uuid NOT NULL,
        CONSTRAINT "REL_auto_apply_configs_userId" UNIQUE ("userId"),
        CONSTRAINT "PK_auto_apply_configs" PRIMARY KEY ("id")
      );
    `);

    // Suggestions table
    await queryRunner.query(`
      CREATE TYPE "public"."suggestions_type_enum" AS ENUM('course', 'book', 'training', 'certification', 'skill');
      
      CREATE TABLE "suggestions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "type" "public"."suggestions_type_enum" NOT NULL,
        "provider" character varying,
        "originalPrice" numeric,
        "discountPrice" numeric,
        "discountPercentage" integer,
        "relevance" integer NOT NULL,
        "duration" character varying,
        "link" character varying,
        "image" character varying,
        "tags" text,
        "isFeatured" boolean NOT NULL DEFAULT false,
        "isPersonalized" boolean NOT NULL DEFAULT false,
        "userId" uuid,
        CONSTRAINT "PK_suggestions" PRIMARY KEY ("id")
      );
    `);

    // Foreign keys
    await queryRunner.query(`
      ALTER TABLE "companies" ADD CONSTRAINT "FK_companies_users" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      ALTER TABLE "documents" ADD CONSTRAINT "FK_documents_users" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      ALTER TABLE "jobs" ADD CONSTRAINT "FK_jobs_users" FOREIGN KEY ("companyUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      ALTER TABLE "applications" ADD CONSTRAINT "FK_applications_users" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      ALTER TABLE "applications" ADD CONSTRAINT "FK_applications_jobs" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      ALTER TABLE "auto_apply_configs" ADD CONSTRAINT "FK_auto_apply_configs_users" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      ALTER TABLE "suggestions" ADD CONSTRAINT "FK_suggestions_users" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
    `);

    // Indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email");
      CREATE INDEX "IDX_users_role" ON "users" ("role");
      CREATE INDEX "IDX_documents_userId" ON "documents" ("userId");
      CREATE INDEX "IDX_documents_type" ON "documents" ("type");
      CREATE INDEX "IDX_jobs_companyUserId" ON "jobs" ("companyUserId");
      CREATE INDEX "IDX_jobs_isActive" ON "jobs" ("isActive");
      CREATE INDEX "IDX_applications_userId" ON "applications" ("userId");
      CREATE INDEX "IDX_applications_jobId" ON "applications" ("jobId");
      CREATE INDEX "IDX_applications_status" ON "applications" ("status");
      CREATE INDEX "IDX_suggestions_type" ON "suggestions" ("type");
      CREATE INDEX "IDX_suggestions_isFeatured" ON "suggestions" ("isFeatured");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.query(`
      ALTER TABLE "companies" DROP CONSTRAINT "FK_companies_users";
      ALTER TABLE "documents" DROP CONSTRAINT "FK_documents_users";
      ALTER TABLE "jobs" DROP CONSTRAINT "FK_jobs_users";
      ALTER TABLE "applications" DROP CONSTRAINT "FK_applications_users";
      ALTER TABLE "applications" DROP CONSTRAINT "FK_applications_jobs";
      ALTER TABLE "auto_apply_configs" DROP CONSTRAINT "FK_auto_apply_configs_users";
      ALTER TABLE "suggestions" DROP CONSTRAINT "FK_suggestions_users";
    `);

    // Drop tables
    await queryRunner.query(`DROP TABLE "suggestions"`);
    await queryRunner.query(`DROP TABLE "auto_apply_configs"`);
    await queryRunner.query(`DROP TABLE "applications"`);
    await queryRunner.query(`DROP TABLE "jobs"`);
    await queryRunner.query(`DROP TABLE "documents"`);
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(`DROP TABLE "users"`);

    // Drop types
    await queryRunner.query(`DROP TYPE "public"."suggestions_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."applications_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."applications_source_enum"`);
    await queryRunner.query(`DROP TYPE "public"."jobs_jobtype_enum"`);
    await queryRunner.query(`DROP TYPE "public"."jobs_workmodel_enum"`);
    await queryRunner.query(`DROP TYPE "public"."documents_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."companies_size_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_subscriptionplan_enum"`);
  }
}
