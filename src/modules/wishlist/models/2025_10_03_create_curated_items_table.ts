import { Gender } from '../../../common/constants';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('curated_items', (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
		table.string('name', 255).notNullable();
		table.string('imageUrl');
		table.decimal('price', 12, 2).notNullable();
		table.enum('gender', Object.values(Gender)).notNullable();
		table.integer('popularity').defaultTo(0);
		table.boolean('isActive').defaultTo(true);
		table.uuid('categoryId').notNullable().references('id').inTable('categories').onDelete('CASCADE');
		table.timestamps(true, true);

		table.index('categoryId');
		table.index(['gender', 'isActive']);
		table.index('popularity');
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('curated_items');
}
