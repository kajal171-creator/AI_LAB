import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateRun1758803581507 implements MigrationInterface {
    name = 'UpdateRun1758803581507'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "runs" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "runs" DROP CONSTRAINT "PK_7b1adf394802068cbdddcdc5698"`);
        await queryRunner.query(`ALTER TABLE "runs" ADD CONSTRAINT "PK_0afa89a82e95a9ad128617b7b88" PRIMARY KEY ("run_id", "id")`);
        await queryRunner.query(`ALTER TABLE "runs" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "runs" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "runs" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "client-profiling" ALTER COLUMN "our_solutions" SET DEFAULT ARRAY['AI Solutions', 'Digital Transformation']`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client-profiling" ALTER COLUMN "our_solutions" SET DEFAULT ARRAY['AI Solutions', 'Digital Transformation'`);
        await queryRunner.query(`ALTER TABLE "runs" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "runs" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "runs" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "runs" DROP CONSTRAINT "PK_0afa89a82e95a9ad128617b7b88"`);
        await queryRunner.query(`ALTER TABLE "runs" ADD CONSTRAINT "PK_7b1adf394802068cbdddcdc5698" PRIMARY KEY ("run_id")`);
        await queryRunner.query(`ALTER TABLE "runs" DROP COLUMN "id"`);
    }

}
