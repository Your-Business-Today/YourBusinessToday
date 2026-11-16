import { organisationDomainRequest } from '$lib/data/personRequests';
import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { domainRunActionName } from './domainRunActionName';
import { mapQuestionsShown, type MapQuestion } from '$lib/data/workflowMap/mapQuestions';
import { workflowMapRunActionName } from './workflowMapRunActionName';
import type { WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';

const domainNextStep =
	"Its Domain page names the things these stations take in and produce, and is filled separately. If it is still empty, offer " +
	`"${organisationDomainRequest}" next: ${domainRunActionName} starts it.`;

function filedSizes({ stage, lines, handovers, arrivals }: WorkflowMapDraft): string {
	const stationCount = lines.flatMap((line) => line.stations).length;
	const parts = `${lines.length} lines, ${stationCount} stations, ${handovers.length} hand-overs and ${arrivals.length} arrivals`;
	return `${mapStageNames[stage]} map: ${parts}`;
}

/** What filing a workflow map answers: the version filed, its size, the questions it still leaves open, and the Domain run that follows it. */
export function filedWorkflowMapAnswer(
	organisationName: string,
	versionNumber: number,
	draft: WorkflowMapDraft,
	questions: MapQuestion[],
	changesSaid: string | null = null
): string {
	const filed = `Filed version ${versionNumber} of ${organisationName}'s ${filedSizes(draft)}.`;
	const sentences = [filed, changesSaid, openQuestions(questions), domainNextStep];
	return sentences.filter((sentence) => sentence !== null).join(' ');
}

function openQuestions(questions: MapQuestion[]): string {
	if (questions.length === 0) return 'It passes every test of a complete map.';
	const firstQuestions = questions.slice(0, mapQuestionsShown.afterFiling).map((question, index) => `${index + 1}. ${question.question}`);
	return (
		`${questions.length} questions are still open, most important first: ${firstQuestions.join(' ')} ` +
		`${workflowMapRunActionName} lists them all, in this order.`
	);
}
