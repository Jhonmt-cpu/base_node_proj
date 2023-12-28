import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    INSERT INTO tb_roles (role_name)
    VALUES ('Admin')
  `);

  await knex.raw(`
    INSERT INTO tb_roles (role_name)
    VALUES ('User')
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DELETE FROM tb_roles WHERE role_name = 'User'
  `);

  await knex.raw(`
    DELETE FROM tb_roles WHERE role_name = 'Admin'
  `);
}
