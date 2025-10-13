import { Knex } from 'knex';

export async function up(knex: Knex) {
	const hasColumn = await knex.schema.hasColumn('wishlist_items', 'uniqueLink');
	if (!hasColumn) {
		await knex.schema.alterTable('wishlist_items', (table) => {
			table.string('uniqueLink', 255).unique();
		});
	}
}

export async function down(knex: Knex) {
	await knex.schema.alterTable('wishlist_items', (table) => {
		table.dropUnique(['uniqueLink']);
		table.dropColumn('uniqueLink');
	});
}
