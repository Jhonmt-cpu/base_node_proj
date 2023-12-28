import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    INSERT INTO tb_genders (gender_name)
    VALUES ('Feminino')
  `);

  await knex.raw(`
    INSERT INTO tb_genders (gender_name)
    VALUES ('Masculino')
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DELETE FROM tb_genders WHERE gender_name = 'Masculino'
  `);

  await knex.raw(`
    DELETE FROM tb_genders WHERE gender_name = 'Feminino'
  `);
}
