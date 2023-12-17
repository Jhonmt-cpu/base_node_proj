import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    CREATE TABLE tb_cities (
      city_id SERIAL PRIMARY KEY,
      city_name VARCHAR (60) NOT NULL UNIQUE,
      city_state_id SMALLINT NOT NULL REFERENCES tb_states (state_id),
      city_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    DROP TABLE tb_cities
  `);
}
