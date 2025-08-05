import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCoursesTable1715360000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
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

      CREATE INDEX "IDX_courses_title" ON "courses" ("title");
      CREATE INDEX "IDX_courses_provider" ON "courses" ("provider");
      CREATE INDEX "IDX_courses_category" ON "courses" ("category");
      CREATE INDEX "IDX_courses_level" ON "courses" ("level");
      CREATE INDEX "IDX_courses_featured" ON "courses" ("featured");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "user_courses";
      DROP TABLE "courses";
      DROP TYPE "course_level_enum";
    `);
  }
}
