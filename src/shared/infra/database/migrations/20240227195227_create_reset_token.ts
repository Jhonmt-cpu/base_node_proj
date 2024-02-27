import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return await knex.raw(`
    CREATE TABLE tb_reset_tokens (
      reset_token_id UUID PRIMARY KEY,
      reset_token_user_id INTEGER NOT NULL REFERENCES tb_users(user_id) ON DELETE CASCADE,
      reset_token_expires_in TIMESTAMP WITH TIME ZONE NOT NULL
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  return await knex.raw(`
    DROP TABLE tb_reset_tokens
  `);
}
