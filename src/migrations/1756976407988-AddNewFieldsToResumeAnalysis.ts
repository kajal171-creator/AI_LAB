import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewFieldsToResumeAnalysis1756976407988 implements MigrationInterface {
    name = 'AddNewFieldsToResumeAnalysis1756976407988'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "resume_analyses" ADD "fileName" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" ADD "rank" integer`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" ADD "recommendation" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" ADD "semantic_similarity" double precision`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" ADD "confidence" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" ADD "strengths" text array`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" ADD "gaps" text array`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" ADD "keyword_analysis" jsonb`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" ADD "detailed_scores" jsonb`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" ADD "stability" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" ADD "suggested_profile" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" ALTER COLUMN "justification" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "resume_analyses" ALTER COLUMN "justification" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" DROP COLUMN "suggested_profile"`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" DROP COLUMN "stability"`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" DROP COLUMN "detailed_scores"`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" DROP COLUMN "keyword_analysis"`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" DROP COLUMN "gaps"`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" DROP COLUMN "strengths"`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" DROP COLUMN "confidence"`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" DROP COLUMN "semantic_similarity"`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" DROP COLUMN "recommendation"`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" DROP COLUMN "rank"`);
        await queryRunner.query(`ALTER TABLE "resume_analyses" DROP COLUMN "fileName"`);
    }

}
