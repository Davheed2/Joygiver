// src/common/config/findMigrationDirs.ts
import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

export function findMigrationDirs(): string[] {
	// Try likely module roots relative to this file (__dirname).
	// Adjust '../..' vs '../../' depending on where this file lives.
	// From your logs __dirname was .../src/common/config, so modules root is ../../modules
	const candidates = [
		path.resolve(__dirname, '../../modules'), // when knex.ts is in src/common/config
		path.resolve(__dirname, '../modules'), // fallback if file moved one level
		path.resolve(__dirname, '../../src/modules'), // extra fallback
	];

	const migrationDirs: string[] = [];

	for (const root of candidates) {
		try {
			if (!fs.existsSync(root)) continue;
			const entries = fs.readdirSync(root, { withFileTypes: true });

			for (const entry of entries) {
				if (!entry.isDirectory()) continue;
				const modelsPath = path.join(root, entry.name, 'models');

				if (!fs.existsSync(modelsPath)) continue;

				// check for at least one migration file (.ts for dev, .js for prod)
				const files = fs.readdirSync(modelsPath);
				const hasMigrationFile = files.some((f) => f.endsWith('.ts') || f.endsWith('.js') || f.endsWith('.mjs'));
				if (hasMigrationFile) {
					migrationDirs.push(modelsPath);
				}
			}
		} catch (err) {
			// ignore and continue to next candidate
			console.warn(`Error scanning ${root}:`, (err as Error).message);
		}
	}

	// If nothing found yet, as last-resort try a glob with forward slashes (works more reliably on Windows)
	if (migrationDirs.length === 0) {
		try {
			// prefer forward slashes in the pattern for cross-platform glob matching
			const rawPattern = path.resolve(__dirname, '../../modules/**/models').replace(/\\/g, '/');

			const found = globSync(rawPattern);
			for (const p of found) {
				// verify it has migration files
				if (fs.existsSync(p)) {
					const files = fs.readdirSync(p);
					if (files.some((f) => f.endsWith('.ts') || f.endsWith('.js'))) migrationDirs.push(p);
				}
			}
		} catch (e) {
			// ignore
			console.warn(`Error scanning:`, (e as Error).message);
		}
	}

	return Array.from(new Set(migrationDirs)); // unique
}
