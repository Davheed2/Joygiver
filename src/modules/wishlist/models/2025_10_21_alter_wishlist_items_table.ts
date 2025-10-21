import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable('wishlist_items', (table) => {
		table.decimal('availableBalance', 15, 2).notNullable().defaultTo(0);
		table.decimal('pendingBalance', 15, 2).notNullable().defaultTo(0);
		table.decimal('withdrawnAmount', 15, 2).notNullable().defaultTo(0);
		table.boolean('isWithdrawable').defaultTo(true);
		table.timestamp('lastWithdrawal').nullable();
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable('wishlist_items', (table) => {
		table.dropColumn('availableBalance');
		table.dropColumn('pendingBalance');
		table.dropColumn('withdrawnAmount');
		table.dropColumn('isWithdrawable');
		table.dropColumn('lastWithdrawal');
	});
}
