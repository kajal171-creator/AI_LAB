import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRagEvaluationMatrix1758177371752 implements MigrationInterface {
    name = 'AddRagEvaluationMatrix1758177371752'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "rag_evaluations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "query" text NOT NULL, "answer" text NOT NULL, "retrieved_contexts" text array NOT NULL, "reference" text NOT NULL, "faithfulness" double precision NOT NULL, "answer_relevancy" double precision NOT NULL, "context_precision" double precision NOT NULL, "context_recall" double precision NOT NULL, CONSTRAINT "PK_ca6dec3c4ad6cb7afbe55c5dcf7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "client-profiling" ALTER COLUMN "our_solutions" SET DEFAULT ARRAY['AI Solutions', 'Digital Transformation']`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client-profiling" ALTER COLUMN "our_solutions" SET DEFAULT ARRAY['AI Solutions', 'Digital Transformation'`);
        await queryRunner.query(`DROP TABLE "rag_evaluations"`);
    }

}
