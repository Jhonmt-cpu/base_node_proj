import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return await knex.raw(`
    CREATE TABLE tb_addresses (
      user_address_id INTEGER PRIMARY KEY REFERENCES tb_users(user_id) ON DELETE CASCADE,
      address_street VARCHAR (70) NOT NULL,
      address_number SMALLINT NOT NULL,
      address_complement VARCHAR (30),
      address_neighborhood_id INTEGER NOT NULL REFERENCES tb_neighborhoods (neighborhood_id),
      address_zip_code INTEGER NOT NULL,
      address_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  return await knex.raw(`
    DROP TABLE tb_addresses
  `);
}
