import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateClientProfiling1759735461507 implements MigrationInterface {
    name = 'UpdateClientProfiling1759735461507'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client-profiling" ALTER COLUMN "our_solutions" SET DEFAULT ARRAY['AI Solutions', 'Digital Transformation']`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client-profiling" ALTER COLUMN "our_solutions" SET DEFAULT ARRAY['AI Solutions', 'Digital Transformation'`);
    }

}
