import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return await knex.raw(`
    CREATE TABLE tb_states (
      state_id SMALLSERIAL PRIMARY KEY,
      state_name VARCHAR (30) NOT NULL UNIQUE,
      state_uf VARCHAR (2) NOT NULL,
      state_created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  return await knex.raw(`
    DROP TABLE tb_states
  `);
}
