import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedClientProfiling1758711554184 implements MigrationInterface {
    name = 'UpdatedClientProfiling1758711554184'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client-profiling" ADD "suggested_profile" jsonb`);
        await queryRunner.query(`ALTER TABLE "client-profiling" ADD "isBookmarked" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "client-profiling" ALTER COLUMN "our_solutions" SET DEFAULT ARRAY['AI Solutions', 'Digital Transformation']`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client-profiling" ALTER COLUMN "our_solutions" SET DEFAULT ARRAY['AI Solutions', 'Digital Transformation'`);
        await queryRunner.query(`ALTER TABLE "client-profiling" DROP COLUMN "isBookmarked"`);
        await queryRunner.query(`ALTER TABLE "client-profiling" DROP COLUMN "suggested_profile"`);
    }

}
