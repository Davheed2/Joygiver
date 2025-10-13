import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('friendships', (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.uuid('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.uuid('friendId').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.enum('status', ['pending', 'accepted', 'blocked']).notNullable().defaultTo('accepted');
		table.string('source', 50).defaultTo('referral'); // referral, manual, import
		table.timestamps(true, true);

		table.unique(['userId', 'friendId']);

		table.index(['userId']);
		table.index(['friendId']);
		table.index(['status']);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('friendships');
}
