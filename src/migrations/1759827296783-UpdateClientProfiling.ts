import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateClientProfiling1759827296783 implements MigrationInterface {
    name = 'UpdateClientProfiling1759827296783'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client-profiling" ALTER COLUMN "our_solutions" SET DEFAULT ARRAY['AI Solutions', 'Digital Transformation']`);
        await queryRunner.query(`ALTER TABLE "client-profiling" DROP COLUMN "key_pitch_points"`);
        await queryRunner.query(`ALTER TABLE "client-profiling" ADD "key_pitch_points" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client-profiling" DROP COLUMN "key_pitch_points"`);
        await queryRunner.query(`ALTER TABLE "client-profiling" ADD "key_pitch_points" text array`);
        await queryRunner.query(`ALTER TABLE "client-profiling" ALTER COLUMN "our_solutions" SET DEFAULT ARRAY['AI Solutions', 'Digital Transformation'`);
    }

}
