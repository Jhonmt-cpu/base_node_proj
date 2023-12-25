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

  await knex.raw(`
    CREATE OR REPLACE FUNCTION default_user_role_id()
    RETURNS INTEGER AS $$
    BEGIN
      RETURN (SELECT role_id FROM tb_roles WHERE role_name = 'User');
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.raw(`
    ALTER TABLE tb_users
    ALTER COLUMN user_role_id SET DEFAULT default_user_role_id()
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE tb_users
    ALTER COLUMN user_role_id SET DEFAULT NULL
  `);

  await knex.raw(`
    DROP FUNCTION default_user_role_id;
  `);

  await knex.raw(`
    DELETE FROM tb_roles WHERE role_name = 'User'
  `);

  await knex.raw(`
    DELETE FROM tb_roles WHERE role_name = 'Admin'
  `);
}
