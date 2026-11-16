import { changesOf, startAmending, type AmendingMap, type AmendingStep } from './amendingMap';
import { putArrivals, putHandovers } from './putLinksOnMap';
import { putLines, putStations } from './putStationsOnMap';
import { removeLines, removeLinks, removeStations } from './removeFromMap';
import type { WorkflowMapDraft } from './workflowMap';
import type { AmendedWorkflowMap, AmendmentRefusal, WorkflowMapAmendment } from './workflowMapAmendment';

type Step = (map: AmendingMap, amendment: WorkflowMapAmendment) => AmendingStep;

/**
 * The order an amendment is applied in: links and stations come off first, so a station removed takes its hand-overs
 * with it; lines and stations are put next; a line comes off only once its stations have gone or moved; new links last,
 * so they can join stations the same amendment put.
 */
const steps: Step[] = [
	(map, { remove }) => removeLinks(map, remove),
	(map, { remove }) => removeStations(map, remove.stationKeys),
	(map, { lines }) => putLines(map, lines),
	(map, { stations }) => putStations(map, stations),
	(map, { remove }) => removeLines(map, remove.lineKeys),
	(map, { handovers }) => putHandovers(map, handovers),
	(map, { arrivals }) => putArrivals(map, arrivals)
];

/** The latest filed version with one amendment applied, whole, as the next version to file; what it does not name is carried forward untouched. */
export function amendWorkflowMap(latest: WorkflowMapDraft, amendment: WorkflowMapAmendment): AmendedWorkflowMap | AmendmentRefusal {
	const map = startAmending(latest);
	for (const step of steps) {
		const refusal = step(map, amendment);
		if (refusal !== null) return refusal;
	}
	const { lines, handovers, arrivals } = map;
	return { draft: { stage: latest.stage, lines, handovers, arrivals }, changes: changesOf(map) };
}
