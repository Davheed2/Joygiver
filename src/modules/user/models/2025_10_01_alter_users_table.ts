import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable('users', (table) => {
		table.string('gender').notNullable().defaultTo('Prefer not to say');
		table.string('dob').notNullable().defaultTo('');
        table.string('phone').notNullable().defaultTo('');
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable('users', (table) => {
		table.dropColumn('gender');
		table.dropColumn('dob');
        table.dropColumn('phone');
	});
}
