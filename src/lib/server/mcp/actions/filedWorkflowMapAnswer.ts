import { organisationDomainRequest } from '$lib/data/personRequests';
import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { domainRunActionName } from './domainRunActionName';
import type { WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';

const domainNextStep =
	"Its Domain page names the things these stations take in and produce, and is filled separately. If it is still empty, offer " +
	`"${organisationDomainRequest}" next: ${domainRunActionName} starts it.`;

function filedSizes({ stage, lines, handovers }: WorkflowMapDraft): string {
	const stationCount = lines.flatMap((line) => line.stations).length;
	return `${mapStageNames[stage]} map: ${lines.length} lines, ${stationCount} stations and ${handovers.length} hand-overs`;
}

/** What filing a workflow map answers: the version filed, its size, and the Domain run that follows it. */
export function filedWorkflowMapAnswer(organisationName: string, versionNumber: number, draft: WorkflowMapDraft): string {
	return `Filed version ${versionNumber} of ${organisationName}'s ${filedSizes(draft)}. ${domainNextStep}`;
}
