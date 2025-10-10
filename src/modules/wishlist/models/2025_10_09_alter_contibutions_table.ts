import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable('contributions', (table) => {
		table.uuid('receiverId').notNullable().references('id').inTable('users').onDelete('CASCADE');
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable('contributions', (table) => {
		table.dropColumn('receiverId');
	});
}
