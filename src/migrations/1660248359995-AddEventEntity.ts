import {MigrationInterface, QueryRunner} from "typeorm";

export class AddEventEntity1660248359995 implements MigrationInterface {
    name = 'AddEventEntity1660248359995'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "event" ("id" SERIAL NOT NULL, "deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "organizer_id" integer NOT NULL, "team_id" integer NOT NULL, "participants" integer array, "type" character varying NOT NULL, "start" TIMESTAMP NOT NULL, "end" TIMESTAMP NOT NULL, "name" character varying NOT NULL, "description" character varying, "link" character varying, "approved" boolean, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0ccaecd3c8ac5ff63f2fbe62ff" ON "event" ("created_on") `);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_fbc9b6120d8394996948eb5325b" FOREIGN KEY ("organizer_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_bfad466ba60a4d2b36d92ff948b" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_bfad466ba60a4d2b36d92ff948b"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_fbc9b6120d8394996948eb5325b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0ccaecd3c8ac5ff63f2fbe62ff"`);
        await queryRunner.query(`DROP TABLE "event"`);
    }

}
