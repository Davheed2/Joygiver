import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('wishlist_items', (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.string('name', 255).notNullable();
		table.string('imageUrl');
		table.decimal('price', 12, 2).notNullable();
		table.integer('quantity').defaultTo(1);
		table.integer('quantityFulfilled').defaultTo(0);
		table.decimal('amountContributed', 12, 2).defaultTo(0);
		table.integer('priority').defaultTo(999);
		table.uuid('wishlistId').notNullable().references('id').inTable('wishlists').onDelete('CASCADE');
		table.uuid('curatedItemId').references('id').inTable('curated_items').onDelete('SET NULL');
		table.uuid('categoryId').notNullable().references('id').inTable('categories');
		table.timestamps(true, true);


		table.index('wishlistId');
		table.index('curatedItemId');
		table.index('priority');
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('wishlist_items');
}
