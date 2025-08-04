import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncKnowlegeChangesRepo1754338466076
  implements MigrationInterface
{
  name = 'SyncKnowlegeChangesRepo1754338466076';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rag_knowledge" ADD "user_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rag_knowledge" ADD CONSTRAINT "FK_595c1121f6a0a1e2bcc78985759" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rag_knowledge" DROP CONSTRAINT "FK_595c1121f6a0a1e2bcc78985759"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rag_knowledge" DROP COLUMN "user_id"`,
    );
  }
}
