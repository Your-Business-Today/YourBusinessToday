import type { SupabaseClient } from '@supabase/supabase-js';
import type { OrganisationModule } from '$lib/data/organisationModules';

export type ModuleSwitch = {
	organisationId: string;
	module: OrganisationModule;
	isOn: boolean;
	switchedBy: string;
};

/** Flip one module for one organisation: the row is kept either way, with who flipped it and when. */
export async function setOrganisationModule(supabase: SupabaseClient, moduleSwitch: ModuleSwitch): Promise<void> {
	const { error } = await supabase.from('organisation_modules').upsert(
		{
			organisation_id: moduleSwitch.organisationId,
			module: moduleSwitch.module,
			is_on: moduleSwitch.isOn,
			switched_by: moduleSwitch.switchedBy,
			switched_at: new Date().toISOString()
		},
		{ onConflict: 'organisation_id,module' }
	);
	if (error) throw error;
}
