import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { organisationModuleRouteSegments, organisationModules } from '$lib/data/organisationModules';

const routesDirectory = join(import.meta.dirname, '../../../routes');
const layoutFile = '+layout.server.ts';
const gateCall = 'requireOrganisationModule(';

function directoriesUnder(directory: string): string[] {
	return readdirSync(directory, { recursive: true, withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => join(entry.parentPath, entry.name));
}

function moduleDirectories(): { module: string; directory: string }[] {
	const directories = directoriesUnder(routesDirectory);
	return organisationModules.flatMap((module) =>
		directories
			.filter((directory) => basename(directory) === organisationModuleRouteSegments[module])
			.map((directory) => ({ module, directory }))
	);
}

function gatesItsModule(module: string, directory: string): boolean {
	const layout = join(directory, layoutFile);
	if (!existsSync(layout)) return false;
	const source = readFileSync(layout, 'utf8');
	return source.includes(gateCall) && source.includes(`'${module}'`);
}

describe('every page of a module asks the one rule', () => {
	it('through a layout at the top of the module that calls requireOrganisationModule with that module', () => {
		const ungated = moduleDirectories().filter(({ module, directory }) => !gatesItsModule(module, directory));
		expect(ungated.map(({ directory }) => directory)).toEqual([]);
	});
});
