import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return await knex.raw(`
    CREATE TABLE tb_phones (
      user_phone_id INTEGER PRIMARY KEY REFERENCES tb_users(user_id) ON DELETE CASCADE,
      phone_number INTEGER NOT NULL UNIQUE,
      phone_ddd SMALLINT NOT NULL,
      phone_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  return await knex.raw(`
    DROP TABLE tb_phones
  `);
}
