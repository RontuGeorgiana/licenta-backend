import {MigrationInterface, QueryRunner} from "typeorm";

export class AddedTeamMembership1645727129618 implements MigrationInterface {
    name = 'AddedTeamMembership1645727129618'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "team" ("id" SERIAL NOT NULL, "deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d79241e0df500cfbeee3d2e445" ON "team" ("created_on") `);
        await queryRunner.query(`CREATE TABLE "membership" ("id" SERIAL NOT NULL, "deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" integer NOT NULL, "team_id" integer NOT NULL, "role" character varying NOT NULL, CONSTRAINT "PK_83c1afebef3059472e7c37e8de8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_adc994e72d6b062635e6ca807b" ON "membership" ("created_on") `);
        await queryRunner.query(`ALTER TABLE "membership" ADD CONSTRAINT "FK_e9c72e8d29784031c96f5c6af8d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "membership" ADD CONSTRAINT "FK_b03fe5cd64dbd43afdc8ee69e61" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "membership" DROP CONSTRAINT "FK_b03fe5cd64dbd43afdc8ee69e61"`);
        await queryRunner.query(`ALTER TABLE "membership" DROP CONSTRAINT "FK_e9c72e8d29784031c96f5c6af8d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_adc994e72d6b062635e6ca807b"`);
        await queryRunner.query(`DROP TABLE "membership"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d79241e0df500cfbeee3d2e445"`);
        await queryRunner.query(`DROP TABLE "team"`);
    }

}
