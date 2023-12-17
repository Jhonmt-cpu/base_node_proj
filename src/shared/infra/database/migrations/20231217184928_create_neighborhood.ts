import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    CREATE TABLE tb_neighborhoods (
      neighborhood_id SERIAL PRIMARY KEY,
      neighborhood_name VARCHAR (60) NOT NULL,
      neighborhood_city_id INTEGER NOT NULL REFERENCES tb_cities (city_id),
      neighborhood_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    DROP TABLE tb_neighborhoods
  `);
}
