import {MigrationInterface, QueryRunner} from "typeorm";

export class AddFolders1654026197456 implements MigrationInterface {
    name = 'AddFolders1654026197456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "folder" ("id" SERIAL NOT NULL, "deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "space_id" integer NOT NULL, "name" character varying NOT NULL, "parent" integer NOT NULL, "children" integer array NOT NULL, CONSTRAINT "PK_6278a41a706740c94c02e288df8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_86d4efeef87ab9fabcecbe1d53" ON "folder" ("created_on") `);
        await queryRunner.query(`ALTER TABLE "folder" ADD CONSTRAINT "FK_56515aacbdf04c92680cf641c52" FOREIGN KEY ("space_id") REFERENCES "space"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "folder" DROP CONSTRAINT "FK_56515aacbdf04c92680cf641c52"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_86d4efeef87ab9fabcecbe1d53"`);
        await queryRunner.query(`DROP TABLE "folder"`);
    }

}
