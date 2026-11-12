/**
 * The modules an administrator switches on for an organisation. The values are the ones the
 * organisation_modules.module column accepts (migrations 0145 and 0202): a new module is added to both.
 */
export const organisationModules = ['books', 'brand', 'business_brain', 'boardroom', 'sales'] as const;

export type OrganisationModule = (typeof organisationModules)[number];

export const organisationModuleLabels: Record<OrganisationModule, string> = {
	books: 'Accounts',
	brand: 'Brand',
	business_brain: 'Your Business Brain',
	boardroom: 'Boardroom',
	sales: 'Sales'
};

/** The route segment each module's pages live under, beneath /organisations/<id>/. */
export const organisationModuleRouteSegments: Record<OrganisationModule, string> = {
	books: 'books',
	brand: 'brand',
	business_brain: 'business-brain',
	boardroom: 'boardroom',
	sales: 'sales'
};

export function isOrganisationModule(value: string): value is OrganisationModule {
	return (organisationModules as readonly string[]).includes(value);
}

export const unknownModuleRefusal = `module must be one of ${organisationModules.join(', ')}.`;

export function moduleListSentence(modules: OrganisationModule[]): string {
	if (modules.length === 0) return 'none';
	return modules.map((module) => organisationModuleLabels[module]).join(', ');
}

const switchWords = { on: 'on', off: 'off' } as const;

export function moduleSwitchedSentence(module: OrganisationModule, isOn: boolean, organisationName: string): string {
	const state = isOn ? switchWords.on : switchWords.off;
	return `${organisationModuleLabels[module]} switched ${state} for ${organisationName}.`;
}
