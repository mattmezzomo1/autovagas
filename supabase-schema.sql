-- Supabase Schema for Autovagas
-- This script combines all migrations into a single SQL file for Supabase

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table and related enums
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

-- Companies table and related enums
CREATE TYPE "public"."companies_size_enum" AS ENUM('micro', 'small', 'medium', 'large', 'enterprise');
CREATE TYPE "public"."companies_subscription_plan_enum" AS ENUM('basic', 'professional', 'enterprise');

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
  "cnpj" character varying,
  "phone" character varying,
  "subscriptionPlan" "public"."companies_subscription_plan_enum" NOT NULL DEFAULT 'basic',
  "subscriptionStatus" character varying DEFAULT 'active',
  "subscriptionStartDate" TIMESTAMP,
  "subscriptionEndDate" TIMESTAMP,
  "stripeCustomerId" character varying,
  "stripeSubscriptionId" character varying,
  "aiCredits" integer DEFAULT 100,
  "settings" jsonb DEFAULT '{}',
  "userId" uuid NOT NULL,
  CONSTRAINT "REL_companies_userId" UNIQUE ("userId"),
  CONSTRAINT "PK_companies" PRIMARY KEY ("id")
);

-- Documents table and related enums
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

-- Jobs table and related enums
CREATE TYPE "public"."jobs_jobtype_enum" AS ENUM('full-time', 'part-time', 'contract', 'internship', 'freelance');
CREATE TYPE "public"."jobs_workmodel_enum" AS ENUM('onsite', 'remote', 'hybrid');
CREATE TYPE "public"."jobs_status_enum" AS ENUM('active', 'paused', 'draft', 'closed');

CREATE TABLE "jobs" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMP,
  "title" character varying NOT NULL,
  "description" text NOT NULL,
  "department" character varying,
  "companyName" character varying NOT NULL,
  "location" character varying NOT NULL,
  "jobType" "public"."jobs_jobtype_enum" NOT NULL DEFAULT 'full-time',
  "workModel" "public"."jobs_workmodel_enum" NOT NULL DEFAULT 'onsite',
  "salaryMin" integer,
  "salaryMax" integer,
  "displaySalary" boolean NOT NULL DEFAULT true,
  "skills" text NOT NULL,
  "requirements" text NOT NULL,
  "responsibilities" text,
  "benefits" text,
  "industry" character varying NOT NULL,
  "workHours" integer,
  "experienceYears" integer,
  "expiresAt" TIMESTAMP NOT NULL,
  "status" "public"."jobs_status_enum" NOT NULL DEFAULT 'active',
  "views" integer DEFAULT 0,
  "applicantsCount" integer DEFAULT 0,
  "aiScore" integer,
  "aiSuggestions" text[],
  "isGeneratedByAi" boolean DEFAULT false,
  "vacancies" integer NOT NULL DEFAULT 1,
  "companyUserId" uuid NOT NULL,
  CONSTRAINT "PK_jobs" PRIMARY KEY ("id")
);

-- Applications table and related enums
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

-- Auto Apply Configs table
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

-- Suggestions table and related enums
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

-- Courses table and related enums (from 1715360000000-CreateCoursesTable.ts)
CREATE TYPE "course_level_enum" AS ENUM ('iniciante', 'intermediário', 'avançado');

CREATE TABLE "courses" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMP,
  "title" character varying NOT NULL,
  "description" text NOT NULL,
  "provider" character varying NOT NULL,
  "url" character varying NOT NULL,
  "image_url" character varying,
  "price" decimal(10,2),
  "discount_price" decimal(10,2),
  "duration" character varying,
  "level" "course_level_enum" NOT NULL DEFAULT 'iniciante',
  "tags" text NOT NULL,
  "category" character varying NOT NULL,
  "rating" decimal(3,1),
  "featured" boolean NOT NULL DEFAULT false,
  CONSTRAINT "PK_courses" PRIMARY KEY ("id")
);

CREATE TABLE "user_courses" (
  "course_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "status" character varying NOT NULL DEFAULT 'enrolled',
  "progress" integer NOT NULL DEFAULT 0,
  CONSTRAINT "PK_user_courses" PRIMARY KEY ("course_id", "user_id"),
  CONSTRAINT "FK_user_courses_course" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE CASCADE,
  CONSTRAINT "FK_user_courses_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- Matchmaking tables and related enums (from 1715370000000-CreateMatchmakingTables.ts)
CREATE TYPE "match_status_enum" AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE "match_criteria" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMP,
  "user_id" uuid NOT NULL,
  "enabled" boolean NOT NULL DEFAULT true,
  "min_experience_years" integer,
  "max_experience_years" integer,
  "desired_skills" text,
  "excluded_skills" text,
  "industries" text,
  "locations" text,
  "remote_only" boolean NOT NULL DEFAULT false,
  "max_matches_per_week" integer NOT NULL DEFAULT 5,
  "notifications_enabled" boolean NOT NULL DEFAULT true,
  CONSTRAINT "PK_match_criteria" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_match_criteria_user_id" UNIQUE ("user_id"),
  CONSTRAINT "FK_match_criteria_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

CREATE TABLE "matches" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMP,
  "initiator_id" uuid NOT NULL,
  "receiver_id" uuid NOT NULL,
  "score" integer NOT NULL,
  "status" "match_status_enum" NOT NULL DEFAULT 'pending',
  "match_reasons" text,
  "notes" text,
  "responded_at" TIMESTAMP,
  CONSTRAINT "PK_matches" PRIMARY KEY ("id"),
  CONSTRAINT "FK_matches_initiator" FOREIGN KEY ("initiator_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "FK_matches_receiver" FOREIGN KEY ("receiver_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- Company Activities table
CREATE TYPE "public"."company_activities_type_enum" AS ENUM('interview_completed', 'ai_interview_scheduled', 'human_interview_scheduled', 'new_candidates', 'ai_analysis_completed', 'job_created', 'job_updated', 'candidate_contacted', 'application_reviewed');

CREATE TABLE "company_activities" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMP,
  "type" "public"."company_activities_type_enum" NOT NULL,
  "title" character varying NOT NULL,
  "description" text,
  "candidateId" uuid,
  "candidateName" character varying,
  "jobId" uuid,
  "actionUrl" character varying,
  "metadata" jsonb,
  "companyUserId" uuid NOT NULL,
  CONSTRAINT "PK_company_activities" PRIMARY KEY ("id")
);

-- Company Chat Messages table
CREATE TYPE "public"."chat_message_sender_enum" AS ENUM('company', 'candidate', 'system');
CREATE TYPE "public"."chat_message_status_enum" AS ENUM('sent', 'delivered', 'read');

CREATE TABLE "company_chat_messages" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMP,
  "content" text NOT NULL,
  "sender" "public"."chat_message_sender_enum" NOT NULL,
  "status" "public"."chat_message_status_enum" NOT NULL DEFAULT 'sent',
  "conversationId" uuid NOT NULL,
  "companyUserId" uuid NOT NULL,
  "candidateUserId" uuid NOT NULL,
  "metadata" jsonb,
  CONSTRAINT "PK_company_chat_messages" PRIMARY KEY ("id")
);

-- Company Chat Conversations table
CREATE TABLE "company_chat_conversations" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMP,
  "lastMessage" text,
  "lastMessageTime" TIMESTAMP,
  "unreadCount" integer DEFAULT 0,
  "companyUserId" uuid NOT NULL,
  "candidateUserId" uuid NOT NULL,
  "jobId" uuid,
  "metadata" jsonb,
  CONSTRAINT "PK_company_chat_conversations" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_company_chat_conversations" UNIQUE ("companyUserId", "candidateUserId")
);

-- Interview Reports table
CREATE TYPE "public"."interview_type_enum" AS ENUM('technical', 'behavioral', 'cultural', 'phone', 'video', 'ai');
CREATE TYPE "public"."interview_status_enum" AS ENUM('scheduled', 'completed', 'cancelled', 'no_show');

CREATE TABLE "interview_reports" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMP,
  "candidateId" uuid NOT NULL,
  "jobId" uuid NOT NULL,
  "interviewType" "public"."interview_type_enum" NOT NULL,
  "status" "public"."interview_status_enum" NOT NULL DEFAULT 'scheduled',
  "scheduledDate" TIMESTAMP,
  "duration" integer,
  "interviewer" character varying,
  "overallScore" integer,
  "technicalScore" integer,
  "communicationScore" integer,
  "culturalScore" integer,
  "experienceScore" integer,
  "questions" jsonb,
  "feedback" text,
  "strengths" text[],
  "improvements" text[],
  "recommendation" character varying,
  "notes" text,
  "companyUserId" uuid NOT NULL,
  CONSTRAINT "PK_interview_reports" PRIMARY KEY ("id")
);

-- AI Interviews table
CREATE TABLE "ai_interviews" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMP,
  "candidateId" uuid NOT NULL,
  "jobId" uuid NOT NULL,
  "scheduledDate" TIMESTAMP NOT NULL,
  "scheduledTime" character varying NOT NULL,
  "status" "public"."interview_status_enum" NOT NULL DEFAULT 'scheduled',
  "duration" integer DEFAULT 30,
  "questions" jsonb,
  "responses" jsonb,
  "aiAnalysis" jsonb,
  "overallScore" integer,
  "completed" boolean DEFAULT false,
  "companyUserId" uuid NOT NULL,
  CONSTRAINT "PK_ai_interviews" PRIMARY KEY ("id")
);

-- Company Calendar Events table
CREATE TYPE "public"."calendar_event_type_enum" AS ENUM('interview', 'meeting', 'call', 'presentation', 'other');

CREATE TABLE "company_calendar_events" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMP,
  "title" character varying NOT NULL,
  "description" text,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  "type" "public"."calendar_event_type_enum" NOT NULL DEFAULT 'meeting',
  "candidateId" uuid,
  "jobId" uuid,
  "location" character varying,
  "isOnline" boolean DEFAULT false,
  "meetingUrl" character varying,
  "attendees" text[],
  "companyUserId" uuid NOT NULL,
  CONSTRAINT "PK_company_calendar_events" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "companies" ADD CONSTRAINT "FK_companies_users" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "documents" ADD CONSTRAINT "FK_documents_users" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "jobs" ADD CONSTRAINT "FK_jobs_users" FOREIGN KEY ("companyUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "applications" ADD CONSTRAINT "FK_applications_users" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "applications" ADD CONSTRAINT "FK_applications_jobs" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "auto_apply_configs" ADD CONSTRAINT "FK_auto_apply_configs_users" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "suggestions" ADD CONSTRAINT "FK_suggestions_users" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "company_activities" ADD CONSTRAINT "FK_company_activities_company_users" FOREIGN KEY ("companyUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "company_activities" ADD CONSTRAINT "FK_company_activities_candidates" FOREIGN KEY ("candidateId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "company_activities" ADD CONSTRAINT "FK_company_activities_jobs" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "company_chat_messages" ADD CONSTRAINT "FK_company_chat_messages_company_users" FOREIGN KEY ("companyUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "company_chat_messages" ADD CONSTRAINT "FK_company_chat_messages_candidate_users" FOREIGN KEY ("candidateUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "company_chat_messages" ADD CONSTRAINT "FK_company_chat_messages_conversations" FOREIGN KEY ("conversationId") REFERENCES "company_chat_conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "company_chat_conversations" ADD CONSTRAINT "FK_company_chat_conversations_company_users" FOREIGN KEY ("companyUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "company_chat_conversations" ADD CONSTRAINT "FK_company_chat_conversations_candidate_users" FOREIGN KEY ("candidateUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "company_chat_conversations" ADD CONSTRAINT "FK_company_chat_conversations_jobs" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "interview_reports" ADD CONSTRAINT "FK_interview_reports_candidates" FOREIGN KEY ("candidateId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "interview_reports" ADD CONSTRAINT "FK_interview_reports_jobs" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "interview_reports" ADD CONSTRAINT "FK_interview_reports_company_users" FOREIGN KEY ("companyUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "ai_interviews" ADD CONSTRAINT "FK_ai_interviews_candidates" FOREIGN KEY ("candidateId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "ai_interviews" ADD CONSTRAINT "FK_ai_interviews_jobs" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "ai_interviews" ADD CONSTRAINT "FK_ai_interviews_company_users" FOREIGN KEY ("companyUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "company_calendar_events" ADD CONSTRAINT "FK_company_calendar_events_candidates" FOREIGN KEY ("candidateId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "company_calendar_events" ADD CONSTRAINT "FK_company_calendar_events_jobs" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "company_calendar_events" ADD CONSTRAINT "FK_company_calendar_events_company_users" FOREIGN KEY ("companyUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Indexes
CREATE INDEX "IDX_users_email" ON "users" ("email");
CREATE INDEX "IDX_users_role" ON "users" ("role");
CREATE INDEX "IDX_documents_userId" ON "documents" ("userId");
CREATE INDEX "IDX_documents_type" ON "documents" ("type");
CREATE INDEX "IDX_jobs_companyUserId" ON "jobs" ("companyUserId");
CREATE INDEX "IDX_jobs_status" ON "jobs" ("status");
CREATE INDEX "IDX_jobs_department" ON "jobs" ("department");
CREATE INDEX "IDX_applications_userId" ON "applications" ("userId");
CREATE INDEX "IDX_applications_jobId" ON "applications" ("jobId");
CREATE INDEX "IDX_applications_status" ON "applications" ("status");
CREATE INDEX "IDX_suggestions_type" ON "suggestions" ("type");
CREATE INDEX "IDX_suggestions_isFeatured" ON "suggestions" ("isFeatured");
CREATE INDEX "IDX_courses_title" ON "courses" ("title");
CREATE INDEX "IDX_courses_provider" ON "courses" ("provider");
CREATE INDEX "IDX_courses_category" ON "courses" ("category");
CREATE INDEX "IDX_courses_level" ON "courses" ("level");
CREATE INDEX "IDX_courses_featured" ON "courses" ("featured");
CREATE INDEX "IDX_matches_initiator_id" ON "matches" ("initiator_id");
CREATE INDEX "IDX_matches_receiver_id" ON "matches" ("receiver_id");
CREATE INDEX "IDX_matches_status" ON "matches" ("status");
CREATE INDEX "IDX_matches_score" ON "matches" ("score");
CREATE INDEX "IDX_company_activities_companyUserId" ON "company_activities" ("companyUserId");
CREATE INDEX "IDX_company_activities_type" ON "company_activities" ("type");
CREATE INDEX "IDX_company_activities_candidateId" ON "company_activities" ("candidateId");
CREATE INDEX "IDX_company_chat_messages_conversationId" ON "company_chat_messages" ("conversationId");
CREATE INDEX "IDX_company_chat_messages_companyUserId" ON "company_chat_messages" ("companyUserId");
CREATE INDEX "IDX_company_chat_conversations_companyUserId" ON "company_chat_conversations" ("companyUserId");
CREATE INDEX "IDX_company_chat_conversations_candidateUserId" ON "company_chat_conversations" ("candidateUserId");
CREATE INDEX "IDX_interview_reports_candidateId" ON "interview_reports" ("candidateId");
CREATE INDEX "IDX_interview_reports_jobId" ON "interview_reports" ("jobId");
CREATE INDEX "IDX_interview_reports_companyUserId" ON "interview_reports" ("companyUserId");
CREATE INDEX "IDX_interview_reports_status" ON "interview_reports" ("status");
CREATE INDEX "IDX_ai_interviews_candidateId" ON "ai_interviews" ("candidateId");
CREATE INDEX "IDX_ai_interviews_jobId" ON "ai_interviews" ("jobId");
CREATE INDEX "IDX_ai_interviews_companyUserId" ON "ai_interviews" ("companyUserId");
CREATE INDEX "IDX_ai_interviews_scheduledDate" ON "ai_interviews" ("scheduledDate");
CREATE INDEX "IDX_company_calendar_events_companyUserId" ON "company_calendar_events" ("companyUserId");
CREATE INDEX "IDX_company_calendar_events_startDate" ON "company_calendar_events" ("startDate");
CREATE INDEX "IDX_company_calendar_events_type" ON "company_calendar_events" ("type");
