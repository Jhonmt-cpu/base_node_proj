import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    CREATE TABLE tb_roles (
      role_id SMALLSERIAL PRIMARY KEY,
      role_name VARCHAR (30) NOT NULL UNIQUE,
      role_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    DROP TABLE tb_roles
  `);
}
