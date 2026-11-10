import { consultancyOfferSteps } from '$lib/data/consultancyOffer';
import type { ServedPart, ServiceOutline } from '$lib/data/companyContext/serviceOutline';

const harnessStepId = 'data-harness';
const perProcessStepIds = ['web-app', 'ai-connector', 'assistant-skills'];

/** What the confirmed context suggests building, in the offer's order, for the staff member to agree or change. */
export function serviceOutlineSection({ sourcesToTake, processes }: ServiceOutline): string {
	return [
		"### Services to propose, in the offer's order",
		harnessLine(sourcesToTake),
		...sourcesToTake.map((served, index) => servedLine(`${index + 1}.`, served, 'creates')),
		processesLine(processes),
		...processes.map((served) => servedLine('-', served, 'serves'))
	].join('\n');
}

function harnessLine(sourcesToTake: ServedPart[]): string {
	const harness = offerStepName(harnessStepId);
	if (sourcesToTake.length === 0) return `First, ${harness}: the context names no source to take yet.`;
	return `First, ${harness}, taking the sources in this order:`;
}

function processesLine(processes: ServedPart[]): string {
	const stages = perProcessStepIds.map(offerStepName).join(', then ');
	if (processes.length === 0) return `Then one service per process (${stages}): the context names no process yet.`;
	return `Then one service per process, in this order, each taken through ${stages}:`;
}

function servedLine(marker: string, { part, servesNames }: ServedPart, verb: string): string {
	if (servesNames.length === 0) return `${marker} ${part.name} (${part.key})`;
	return `${marker} ${part.name} (${part.key}): ${verb} ${servesNames.join(', ')}`;
}

function offerStepName(stepId: string): string {
	const step = consultancyOfferSteps.find((offerStep) => offerStep.id === stepId);
	return step?.name ?? stepId;
}
