import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	Confidence,
	ContextPart,
	ContextPartKind,
	ProcessStep,
	ReviewState
} from '$lib/data/companyContext/companyContext';

export type StoredParts = {
	parts: ContextPart[];
	steps: ProcessStep[];
	keysById: Map<string, string>;
};

type PartRow = Record<string, unknown>;

const partColumns =
	'id, part_key, kind, name, description, is_core, seen_in_connector, seen_at_place, confidence, review_state, what_is_wrong';

/** One version's parts, and each process's steps in order, told by the keys the client's Claude gave them. */
export async function readContextParts(supabase: SupabaseClient, versionId: string): Promise<StoredParts> {
	const { data, error } = await supabase
		.from('company_context_parts')
		.select(partColumns)
		.eq('version_id', versionId)
		.order('name');
	if (error) throw error;
	const keysById = new Map(data.map((row: PartRow) => [String(row.id), String(row.part_key)]));
	const steps = await readSteps(supabase, keysById);
	return { parts: data.map(partOf), steps, keysById };
}

function partOf(row: PartRow): ContextPart {
	const connector = row.seen_in_connector === null ? null : String(row.seen_in_connector);
	const place = row.seen_at_place === null ? null : String(row.seen_at_place);
	return {
		key: String(row.part_key),
		kind: String(row.kind) as ContextPartKind,
		name: String(row.name),
		description: row.description === null ? null : String(row.description),
		isCore: row.is_core === true,
		seenIn: connector === null ? null : { connector, place },
		confidence: String(row.confidence) as Confidence,
		reviewState: String(row.review_state) as ReviewState,
		whatIsWrong: row.what_is_wrong === null ? null : String(row.what_is_wrong)
	};
}

async function readSteps(supabase: SupabaseClient, keysById: Map<string, string>): Promise<ProcessStep[]> {
	if (keysById.size === 0) return [];
	const { data, error } = await supabase
		.from('company_context_steps')
		.select('process_part_id, position, description, role_part_id')
		.in('process_part_id', [...keysById.keys()])
		.order('position');
	if (error) throw error;
	return data.map((row) => ({
		processKey: keysById.get(String(row.process_part_id)) ?? '',
		position: Number(row.position),
		description: String(row.description),
		roleKey: row.role_part_id === null ? null : (keysById.get(String(row.role_part_id)) ?? null)
	}));
}
