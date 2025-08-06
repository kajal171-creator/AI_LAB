import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncConversationsRepo1754341904055 implements MigrationInterface {
    name = 'SyncConversationsRepo1754341904055'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "rag_conversations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "title" character varying(255), "user_id" uuid, "ai_user_id" uuid, CONSTRAINT "PK_f773057613b0c63b6b28d5b8ae2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rag_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "content" text NOT NULL, "sender_id" uuid NOT NULL, "receiver_id" uuid NOT NULL, "user_id" uuid NOT NULL, "conversation_id" uuid, CONSTRAINT "PK_b7d13046c6a9b48a61806f6ef25" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "conversation_knowledge_map" ("conversation_id" uuid NOT NULL, "knowledge_id" uuid NOT NULL, CONSTRAINT "PK_937d299fb63e398f4a4bbae25ba" PRIMARY KEY ("conversation_id", "knowledge_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9cea1c2e06b87c9cacf0b4dcab" ON "conversation_knowledge_map" ("conversation_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_aa4913e6bc353600fb5ca72bac" ON "conversation_knowledge_map" ("knowledge_id") `);
        await queryRunner.query(`ALTER TABLE "rag_conversations" ADD CONSTRAINT "FK_2112d19ae3b4df7862f6d823893" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rag_conversations" ADD CONSTRAINT "FK_0e69b66a5db03b7dbe9a9fcc646" FOREIGN KEY ("ai_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rag_messages" ADD CONSTRAINT "FK_1ae2292044030db50cc86f0fc76" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rag_messages" ADD CONSTRAINT "FK_b81fe785e701f8903b6b7fdd52e" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rag_messages" ADD CONSTRAINT "FK_07f4bf67b3042bd80865f90db8e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rag_messages" ADD CONSTRAINT "FK_b3c10916af3e4fa71decf09c76b" FOREIGN KEY ("conversation_id") REFERENCES "rag_conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_knowledge_map" ADD CONSTRAINT "FK_9cea1c2e06b87c9cacf0b4dcabb" FOREIGN KEY ("conversation_id") REFERENCES "rag_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "conversation_knowledge_map" ADD CONSTRAINT "FK_aa4913e6bc353600fb5ca72bac4" FOREIGN KEY ("knowledge_id") REFERENCES "rag_knowledge"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation_knowledge_map" DROP CONSTRAINT "FK_aa4913e6bc353600fb5ca72bac4"`);
        await queryRunner.query(`ALTER TABLE "conversation_knowledge_map" DROP CONSTRAINT "FK_9cea1c2e06b87c9cacf0b4dcabb"`);
        await queryRunner.query(`ALTER TABLE "rag_messages" DROP CONSTRAINT "FK_b3c10916af3e4fa71decf09c76b"`);
        await queryRunner.query(`ALTER TABLE "rag_messages" DROP CONSTRAINT "FK_07f4bf67b3042bd80865f90db8e"`);
        await queryRunner.query(`ALTER TABLE "rag_messages" DROP CONSTRAINT "FK_b81fe785e701f8903b6b7fdd52e"`);
        await queryRunner.query(`ALTER TABLE "rag_messages" DROP CONSTRAINT "FK_1ae2292044030db50cc86f0fc76"`);
        await queryRunner.query(`ALTER TABLE "rag_conversations" DROP CONSTRAINT "FK_0e69b66a5db03b7dbe9a9fcc646"`);
        await queryRunner.query(`ALTER TABLE "rag_conversations" DROP CONSTRAINT "FK_2112d19ae3b4df7862f6d823893"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aa4913e6bc353600fb5ca72bac"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9cea1c2e06b87c9cacf0b4dcab"`);
        await queryRunner.query(`DROP TABLE "conversation_knowledge_map"`);
        await queryRunner.query(`DROP TABLE "rag_messages"`);
        await queryRunner.query(`DROP TABLE "rag_conversations"`);
    }

}
