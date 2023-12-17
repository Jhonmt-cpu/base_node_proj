import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    CREATE TABLE tb_users (
      user_id SERIAL PRIMARY KEY,
      user_name VARCHAR (250) NOT NULL,
      user_email VARCHAR (250) NOT NULL UNIQUE,
      user_password VARCHAR NOT NULL,
      user_cpf BIGINT NOT NULL UNIQUE,
      user_gender_id SMALLINT NOT NULL REFERENCES tb_genders(gender_id),
      user_role_id SMALLINT NOT NULL REFERENCES tb_roles(role_id),
      user_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      user_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    DROP TABLE tb_users
  `);
}
