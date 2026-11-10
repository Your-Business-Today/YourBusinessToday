import type { SupabaseClient } from '@supabase/supabase-js';
import type { CompanyContextDraft, ContextPart } from '$lib/data/companyContext/companyContext';

export type ContextRecording = {
	organisationId: string;
	recordedBy: string;
	draft: CompanyContextDraft;
};

/** Adds the next numbered version of an organisation's company context, whole, and says which number it took. */
export async function recordCompanyContext(supabase: SupabaseClient, recording: ContextRecording): Promise<number> {
	const { draft } = recording;
	const context = { ...draft, parts: draft.parts.map(storedPart) };
	const { data, error } = await supabase.rpc('record_company_context', {
		target_organisation: recording.organisationId,
		recorder: recording.recordedBy,
		context
	});
	if (error) throw error;
	return Number(data);
}

function storedPart(part: ContextPart): Record<string, unknown> {
	const { seenIn, ...rest } = part;
	return {
		...rest,
		seenInConnector: seenIn?.connector ?? null,
		seenAtPlace: seenIn?.place ?? null
	};
}
