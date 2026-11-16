import { requireOrganisationModule } from '$lib/server/auth/requireOrganisationModule';

const salesModule = 'sales';

/** The gate every Sales page and form passes: Sales switched on for the organisation whose register it is, else a 404. */
export async function requireSalesSwitchedOn(locals: App.Locals, organisationId: string): Promise<void> {
	await requireOrganisationModule(locals, organisationId, salesModule);
}
