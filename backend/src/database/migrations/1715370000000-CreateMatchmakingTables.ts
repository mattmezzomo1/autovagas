import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMatchmakingTables1715370000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
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

      CREATE INDEX "IDX_matches_initiator_id" ON "matches" ("initiator_id");
      CREATE INDEX "IDX_matches_receiver_id" ON "matches" ("receiver_id");
      CREATE INDEX "IDX_matches_status" ON "matches" ("status");
      CREATE INDEX "IDX_matches_score" ON "matches" ("score");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "matches";
      DROP TABLE "match_criteria";
      DROP TYPE "match_status_enum";
    `);
  }
}
