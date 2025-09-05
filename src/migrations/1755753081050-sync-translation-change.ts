import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncTranslationChange1755753081050 implements MigrationInterface {
    name = 'SyncTranslationChange1755753081050'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."rag_translation_aimodeltype_enum" AS ENUM('gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo')`);
        await queryRunner.query(`ALTER TABLE "rag_translation" ADD "aiModelType" "public"."rag_translation_aimodeltype_enum" NOT NULL DEFAULT 'gpt-4o-mini'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rag_translation" DROP COLUMN "aiModelType"`);
        await queryRunner.query(`DROP TYPE "public"."rag_translation_aimodeltype_enum"`);
    }

}
