import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('curated_items', (table) => {
		table.uuid('createdBy').nullable().references('id').inTable('users').onDelete('CASCADE');
		table.enum('itemType', ['global', 'custom']).notNullable().defaultTo('global');
		table.boolean('isPublic').notNullable().defaultTo(true);
	});

	await knex.schema.alterTable('curated_items', (table) => {
		table.index(['createdBy']);
		table.index(['itemType', 'isPublic']);
	});

	await knex.raw(`
		UPDATE curated_items 
		SET "itemType" = 'global', 
		    "isPublic" = true
		WHERE "createdBy" IS NULL
	`);
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('curated_items', (table) => {
		table.dropColumn('createdBy');
		table.dropColumn('itemType');
		table.dropColumn('isPublic');
	});
}