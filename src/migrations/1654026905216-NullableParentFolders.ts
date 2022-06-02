import {MigrationInterface, QueryRunner} from "typeorm";

export class NullableParentFolders1654026905216 implements MigrationInterface {
    name = 'NullableParentFolders1654026905216'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "folder" ALTER COLUMN "parent" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "folder" ALTER COLUMN "parent" SET NOT NULL`);
    }

}
