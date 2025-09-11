import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncUserId1757589210172 implements MigrationInterface {
    name = 'SyncUserId1757589210172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client-profiling" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "client-profiling" ALTER COLUMN "our_solutions" SET DEFAULT ARRAY['AI Solutions', 'Digital Transformation']`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client-profiling" ALTER COLUMN "our_solutions" SET DEFAULT ARRAY['AI Solutions', 'Digital Transformation'`);
        await queryRunner.query(`ALTER TABLE "client-profiling" DROP COLUMN "userId"`);
    }

}
