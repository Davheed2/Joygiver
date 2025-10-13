import { Knex } from 'knex';
import { nanoid } from 'nanoid';
import slugify from 'slugify';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('wishlist_items', (table) => {
		table.decimal('totalContributed', 15, 2).notNullable().defaultTo(0);
		table.integer('contributorsCount').notNullable().defaultTo(0);
		table.boolean('isFunded').defaultTo(false); // true when totalContributed >= price
		table.timestamp('fundedAt').nullable();
		table.string('uniqueLink', 50).nullable();
	});

	const items = await knex('wishlist_items').select('id');

	for (const item of items) {
		const uniqueId = nanoid(10);
		const uniqueLink = `https://joygiver.co/${slugify('wishlist-item', { lower: true, strict: true })}-${uniqueId}`;

		await knex('wishlist_items').where({ id: item.id }).update({ uniqueLink });
	}

	// Now make it not nullable and unique
	await knex.schema.alterTable('wishlist_items', (table) => {
		table.string('uniqueLink', 50).notNullable().unique().alter();
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable('wishlist_items', (table) => {
		table.dropColumn('totalContributed');
		table.dropColumn('contributorsCount');
		table.dropColumn('isFunded');
		table.dropColumn('fundedAt');
		table.dropColumn('uniqueLink');
	});
}
