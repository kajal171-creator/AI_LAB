import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncKnowlegeRepo1754307127115 implements MigrationInterface {
  name = 'SyncKnowlegeRepo1754307127115';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "rag_knowledge" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "url" character varying NOT NULL, CONSTRAINT "PK_6c4cda37c9407c554cc45eb98fb" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "rag_knowledge"`);
  }
}
