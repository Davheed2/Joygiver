import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable('users', (table) => {
		table.uuid('referredBy').nullable().references('id').inTable('users').onDelete('SET NULL');
		table.integer('referralCount').notNullable().defaultTo(0);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable('users', (table) => {
		table.dropColumn('referredBy');
        table.dropColumn('referralCount');
	});
}
