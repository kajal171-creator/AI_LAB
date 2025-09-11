import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateClientProfiling1757587147250 implements MigrationInterface {
    name = 'CreateClientProfiling1757587147250'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "client-profiling" ("id" SERIAL NOT NULL, "attendee_name" character varying NOT NULL, "title" character varying NOT NULL, "organization" character varying NOT NULL, "meeting_date" date, "our_company" character varying NOT NULL DEFAULT 'TechCorp', "our_solutions" text array NOT NULL DEFAULT ARRAY['AI Solutions', 'Digital Transformation'], "prospect_info" jsonb, "key_pitch_points" text array, "background_education" text array, "recent_highlights" text array, "portfolio_departments" text array, "major_initiatives" text array, "connection_opportunities" text array, "data_sources" jsonb, "scraping_summary" jsonb, "generated_at" TIMESTAMP, "confidence_score" double precision, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3b30015f72b62261bbb3e9ff7b9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "client-profiling"`);
    }

}
