import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable('wishlist_items', (table) => {
		table.integer('viewsCount').defaultTo(0);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable('wishlist_items', (table) => {
		table.dropColumn('viewsCount');
	});
}
