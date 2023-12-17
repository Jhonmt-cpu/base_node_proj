import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    CREATE TRIGGER update_address_modtime
    BEFORE UPDATE ON tb_addresses
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    DROP TRIGGER update_address_modtime ON tb_addresses
  `);
}
