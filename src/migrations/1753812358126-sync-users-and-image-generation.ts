import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncUsersAndImageGeneration1753812358126 implements MigrationInterface {
    name = 'SyncUsersAndImageGeneration1753812358126'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image_generation_history" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "image_generation_history" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "image_generation_history" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "image_generation_history" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710"`);
        await queryRunner.query(`ALTER TABLE "image_generation_history" DROP CONSTRAINT "PK_09b1c5a240e787e8656a57be040"`);
        await queryRunner.query(`ALTER TABLE "image_generation_history" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "image_generation_history" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "image_generation_history" ADD CONSTRAINT "PK_09b1c5a240e787e8656a57be040" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image_generation_history" DROP CONSTRAINT "PK_09b1c5a240e787e8656a57be040"`);
        await queryRunner.query(`ALTER TABLE "image_generation_history" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "image_generation_history" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "image_generation_history" ADD CONSTRAINT "PK_09b1c5a240e787e8656a57be040" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`);
        await queryRunner.query(`ALTER TABLE "image_generation_history" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "image_generation_history" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "image_generation_history" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "image_generation_history" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}
