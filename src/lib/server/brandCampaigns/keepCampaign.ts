import { CampaignStatuses, type CampaignToKeep } from '$lib/brand/campaigns/campaign';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Keeps a planned campaign in the organisation's brand and gives its id. */
export async function keepCampaign(supabase: SupabaseClient, campaign: CampaignToKeep): Promise<string> {
	const { data, error } = await supabase.from('brand_campaigns').insert(rowOf(campaign)).select('id').single();
	if (error) throw error;
	return data.id as string;
}

function rowOf({ organisationId, accountId, plan }: CampaignToKeep): Record<string, unknown> {
	return {
		organisation_id: organisationId,
		name: plan.name,
		objective: plan.objective,
		budget_pence: plan.budgetPence,
		starts_on: plan.startsOn,
		ends_on: plan.endsOn,
		status: CampaignStatuses.planned,
		created_by: accountId
	};
}
