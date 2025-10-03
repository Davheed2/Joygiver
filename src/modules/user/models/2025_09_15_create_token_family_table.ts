import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('token_family', (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.uuid('userId').notNullable().references('id').inTable('users').onDelete('SET NULL');
        table.string('familyId').notNullable();
		table.string('refreshToken').nullable();
        table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('token_family');
}
