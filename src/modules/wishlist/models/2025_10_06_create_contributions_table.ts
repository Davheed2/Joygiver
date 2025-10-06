import { ContributionStatus } from '../../../common/constants';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('contributions', (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.uuid('wishlistId').notNullable().references('id').inTable('wishlists').onDelete('CASCADE');
		table.uuid('wishlistItemId').references('id').inTable('wishlist_items').onDelete('SET NULL');
		table.string('contributorName', 255).notNullable();
		table.string('contributorEmail', 255);
		table.string('contributorPhone', 50);
		table.decimal('amount', 12, 2).notNullable();
		table.text('message');
		table.boolean('isAnonymous').defaultTo(false);
		table.enum('status', Object.values(ContributionStatus)).defaultTo(ContributionStatus.PENDING);
		table.string('paymentReference', 255).notNullable().unique();
		table.string('paymentMethod', 50).notNullable();
		table.timestamps(true, true);

		table.index('wishlistId');
		table.index('wishlistItemId');
		table.index('paymentReference');
		table.index(['wishlistId', 'status']);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('contributions');
}
