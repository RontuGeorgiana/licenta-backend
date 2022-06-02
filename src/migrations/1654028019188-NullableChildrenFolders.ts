import {MigrationInterface, QueryRunner} from "typeorm";

export class NullableChildrenFolders1654028019188 implements MigrationInterface {
    name = 'NullableChildrenFolders1654028019188'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "folder" ALTER COLUMN "children" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "folder" ALTER COLUMN "children" SET NOT NULL`);
    }

}
