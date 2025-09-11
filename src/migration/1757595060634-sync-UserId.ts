import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncUserId1757595060634 implements MigrationInterface {
    name = 'SyncUserId1757595060634'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client-profiling" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "client-profiling" ALTER COLUMN "our_solutions" SET DEFAULT ARRAY['AI Solutions', 'Digital Transformation']`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client-profiling" ALTER COLUMN "our_solutions" SET DEFAULT ARRAY['AI Solutions', 'Digital Transformation'`);
        await queryRunner.query(`ALTER TABLE "client-profiling" ALTER COLUMN "userId" SET NOT NULL`);
    }

}
