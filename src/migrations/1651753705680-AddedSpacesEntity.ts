import {MigrationInterface, QueryRunner} from "typeorm";

export class AddedSpacesEntity1651753705680 implements MigrationInterface {
    name = 'AddedSpacesEntity1651753705680'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "space" ("id" SERIAL NOT NULL, "deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "team_id" integer NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_094f5ec727fe052956a11623640" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8fee5b72f43a590a230abb85f2" ON "space" ("created_on") `);
        await queryRunner.query(`ALTER TABLE "space" ADD CONSTRAINT "FK_6fca677164a5d7f400b4eaf9ed6" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "space" DROP CONSTRAINT "FK_6fca677164a5d7f400b4eaf9ed6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8fee5b72f43a590a230abb85f2"`);
        await queryRunner.query(`DROP TABLE "space"`);
    }

}
