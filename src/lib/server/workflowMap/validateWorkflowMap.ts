import { mapStages } from '$lib/data/workflowMap/workflowMap';
import { isRefused, readChoice } from '$lib/server/filing/filedText';
import { validateMapArrivals } from './validateMapArrivals';
import { validateMapHandovers } from './validateMapHandovers';
import { validateMapLines } from './validateMapLines';
import type { WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';
import type { Refusal } from '$lib/server/portal/portalFormReading';

/** Reads a whole version from a connector call and refuses the first value that does not fit its column. */
export function validateWorkflowMap(input: Record<string, unknown>): WorkflowMapDraft | Refusal {
	const stage = readChoice(input.stage, mapStages, 'stage');
	if (isRefused(stage)) return stage;
	const lines = validateMapLines(input.lines);
	if (isRefused(lines)) return lines;
	const handovers = validateMapHandovers(input.handovers, lines);
	if (isRefused(handovers)) return handovers;
	const arrivals = validateMapArrivals(input.arrivals, lines);
	if (isRefused(arrivals)) return arrivals;
	return { stage, lines, handovers, arrivals };
}
