import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { organisationModuleRouteSegments, organisationModules, type OrganisationModule } from '$lib/data/organisationModules';

const routesDirectory = join(import.meta.dirname, '../../../routes');
const layoutFile = '+layout.server.ts';
const moduleGateCall = 'requireOrganisationModule(';
const boardroomGateCall = 'requireBoardroomDirector(';

function directoriesUnder(directory: string): string[] {
	return readdirSync(directory, { recursive: true, withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => join(entry.parentPath, entry.name));
}

function moduleDirectories(): { module: OrganisationModule; directory: string }[] {
	const directories = directoriesUnder(routesDirectory);
	return organisationModules.flatMap((module) =>
		directories
			.filter((directory) => basename(directory) === organisationModuleRouteSegments[module])
			.map((directory) => ({ module, directory }))
	);
}

function asksTheModuleRule(module: OrganisationModule): (source: string) => boolean {
	return (source) => source.includes(moduleGateCall) && source.includes(`'${module}'`);
}

const gateOf: Record<OrganisationModule, (source: string) => boolean> = {
	books: asksTheModuleRule('books'),
	brand: asksTheModuleRule('brand'),
	business_brain: asksTheModuleRule('business_brain'),
	boardroom: (source) => source.includes(boardroomGateCall),
	sales: asksTheModuleRule('sales')
};

function gatesItsModule(module: OrganisationModule, directory: string): boolean {
	const layout = join(directory, layoutFile);
	if (!existsSync(layout)) return false;
	const source = readFileSync(layout, 'utf8');
	return gateOf[module](source);
}

describe('every page of a module asks the one rule', () => {
	it('through a layout at the top of the module that calls requireOrganisationModule with that module, or requireBoardroomDirector for the Boardroom', () => {
		const ungated = moduleDirectories().filter(({ module, directory }) => !gatesItsModule(module, directory));
		expect(ungated.map(({ directory }) => directory)).toEqual([]);
	});
});
