import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncUserId1757595493683 implements MigrationInterface {
    name = 'SyncUserId1757595493683'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client-profiling" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "client-profiling" ALTER COLUMN "our_solutions" SET DEFAULT ARRAY['AI Solutions', 'Digital Transformation']`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client-profiling" ALTER COLUMN "our_solutions" SET DEFAULT ARRAY['AI Solutions', 'Digital Transformation'`);
        await queryRunner.query(`ALTER TABLE "client-profiling" ADD "userId" character varying NOT NULL`);
    }

}
