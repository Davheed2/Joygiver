
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('wishlist_items', (table) => {
		table.string('uniqueLink', 250).alter();
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('wishlist_items', (table) => {
		table.string('uniqueLink', 50).alter();
	});
}