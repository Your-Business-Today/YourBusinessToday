import { requireOrganisationManager } from '$lib/server/auth/requireOrganisationManager';
import { exportOrganisationData } from '$lib/server/organisationExport/exportOrganisationData';
import { exportedSentence } from '$lib/data/organisationExport/exportedSentence';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { Actions } from './$types';

export const organisationExportActions = {
	exportData: async ({ locals, params }) => {
		const { organisation, user } = await requireOrganisationManager(locals, params.organisationId);
		const finished = await exportOrganisationData(supabaseServiceClient(), organisation, user.id);
		return { message: exportedSentence(organisation.name, finished), exportLinks: finished.partLinks };
	}
} satisfies Actions;
