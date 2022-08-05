import {MigrationInterface, QueryRunner} from "typeorm";

export class TaskEntity1656011214501 implements MigrationInterface {
    name = 'TaskEntity1656011214501'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "task" ("id" SERIAL NOT NULL, "deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "folder_id" integer NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "assignee" integer, "due_date" TIMESTAMP, "priority" integer, "status" character varying NOT NULL, "time_tracked" integer, "estimation" integer, "tags" character varying array, "type" character varying NOT NULL, "parent" integer, "children" integer array, CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e31833c026293148c492f3396e" ON "task" ("created_on") `);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_fa8093a5701bda6111372bc1f64" FOREIGN KEY ("folder_id") REFERENCES "folder"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_fa8093a5701bda6111372bc1f64"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e31833c026293148c492f3396e"`);
        await queryRunner.query(`DROP TABLE "task"`);
    }

}
