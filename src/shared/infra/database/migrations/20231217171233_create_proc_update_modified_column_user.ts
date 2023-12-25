import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return await knex.raw(`
    CREATE OR REPLACE FUNCTION update_modified_column_user()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.user_updated_at = now();
      RETURN NEW; 
    END;
    $$ language 'plpgsql'
  `);
}

export async function down(knex: Knex): Promise<void> {
  return await knex.raw(`
    DROP FUNCTION update_modified_column_user
  `);
}
