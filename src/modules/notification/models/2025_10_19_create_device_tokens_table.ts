import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('device_tokens', (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.uuid('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
		table.text('token').notNullable();
		table.enum('platform', ['ios', 'android']).notNullable();
		table.string('deviceId', 255).nullable();
		table.boolean('isActive').notNullable().defaultTo(true);
		table.timestamp('lastUsedAt').notNullable().defaultTo(knex.fn.now());
		table.timestamps(true, true);

		table.unique(['token']);

		// Indexes for efficient queries
		table.index(['userId', 'isActive']);
		table.index(['token']);
		table.index(['isActive', 'updated_at']);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('device_tokens');
}
