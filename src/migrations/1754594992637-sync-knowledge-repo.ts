import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncKnowledgeRepo1754594992637 implements MigrationInterface {
    name = 'SyncKnowledgeRepo1754594992637'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rag_knowledge" ADD "file_name" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rag_knowledge" DROP COLUMN "file_name"`);
    }

}
