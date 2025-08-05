import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocumentsTable1715900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create document_type enum
    await queryRunner.query(`
      CREATE TYPE "public"."documents_type_enum" AS ENUM('RESUME', 'COVER_LETTER', 'PORTFOLIO', 'CERTIFICATE', 'OTHER')
    `);

    // Create document_format enum
    await queryRunner.query(`
      CREATE TYPE "public"."documents_format_enum" AS ENUM('PDF', 'DOCX', 'TXT', 'HTML', 'MARKDOWN')
    `);

    // Create document_source enum
    await queryRunner.query(`
      CREATE TYPE "public"."documents_source_enum" AS ENUM('UPLOAD', 'AI_GENERATED', 'TEMPLATE')
    `);

    // Create documents table
    await queryRunner.query(`
      CREATE TABLE "documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "type" "public"."documents_type_enum" NOT NULL DEFAULT 'RESUME',
        "format" "public"."documents_format_enum" NOT NULL DEFAULT 'PDF',
        "source" "public"."documents_source_enum" NOT NULL DEFAULT 'UPLOAD',
        "url" character varying NOT NULL,
        "fileSize" integer,
        "contentType" character varying,
        "isDefault" boolean NOT NULL DEFAULT false,
        "content" text,
        "metadata" jsonb,
        "usageCount" integer NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_documents" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "documents" 
      ADD CONSTRAINT "FK_documents_users" 
      FOREIGN KEY ("userId") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_documents_userId" ON "documents" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_documents_type" ON "documents" ("type")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_documents_format" ON "documents" ("format")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_documents_source" ON "documents" ("source")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_documents_isDefault" ON "documents" ("isDefault")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_documents_isActive" ON "documents" ("isActive")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_documents_isActive"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_documents_isDefault"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_documents_source"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_documents_format"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_documents_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_documents_userId"`);

    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "documents" DROP CONSTRAINT IF EXISTS "FK_documents_users"
    `);

    // Drop documents table
    await queryRunner.query(`DROP TABLE IF EXISTS "documents"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."documents_source_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."documents_format_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."documents_type_enum"`);
  }
}
