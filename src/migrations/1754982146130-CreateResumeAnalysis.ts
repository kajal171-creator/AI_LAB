import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateResumeAnalysis1754982146130 implements MigrationInterface {
    name = 'CreateResumeAnalysis1754982146130'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "resume_analyses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "description" text NOT NULL, "candidateName" character varying(255) NOT NULL, "resumeLink" text NOT NULL, "score" double precision NOT NULL, "justification" text NOT NULL, "user_id" uuid, CONSTRAINT "PK_96777adcd17e3e0c9537b7a2dd1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" ADD CONSTRAINT "FK_56837e73df26ff8568480cb9bf8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "resume_analyses" DROP CONSTRAINT "FK_56837e73df26ff8568480cb9bf8"`);
        await queryRunner.query(`DROP TABLE "resume_analyses"`);
    }

}
