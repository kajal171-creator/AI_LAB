import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTranslation1755501601459 implements MigrationInterface {
    name = 'CreateTranslation1755501601459'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "rag_translation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "source_language" character varying NOT NULL, "target_language" character varying NOT NULL, "original_text" text NOT NULL, "translated_text" text, "style" character varying NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_ba9b57c2c9c56d16991d47a232f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "rag_translation" ADD CONSTRAINT "FK_ec8819d19cb72cb767f473e0e92" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rag_translation" DROP CONSTRAINT "FK_ec8819d19cb72cb767f473e0e92"`);
        await queryRunner.query(`DROP TABLE "rag_translation"`);
    }

}
