import { workflowMapRequest } from '$lib/data/personRequests';
import type { StationState } from '$lib/data/workflowMap/workflowMap';

/** What the Workflow map page says around its maps. */
export function workflowMapMessages(organisationName: string) {
	return {
		introduction: `Who does what at ${organisationName}, and what passes between them.`,
		brainClosed:
			`Your Business Brain is not switched on for ${organisationName}, or not open to you. ` +
			'The workflow map is kept beside the domain in the brain, so it shows here once the brain is on.',
		noMap: `No workflow map has been filed for ${organisationName} yet. Say "${workflowMapRequest}" to your Claude to start one.`,
		chooseStation: 'Choose a station to see what it takes in, what it produces and where it is done.',
		noChanges: 'The After changes nothing the Before shows.'
	};
}

/** The words of the What changes table. */
export const changeWords = {
	task: 'Task',
	handover: 'Hand-over',
	ourProducts: 'one of our products',
	notOnTheMap: 'Not on the map',
	stopsGoingWrong: 'Stops going wrong',
	noLongerHandedOver: 'No longer handed over',
	stateLeads: { ours: 'Done in', planned: 'Planned for', elsewhere: 'Done in' } satisfies Record<StationState, string>
} as const;

/** The words of the Questions table. */
export const questionWords = {
	label: 'What the map still leaves open, most important first',
	question: 'Question',
	about: 'About',
	line: 'Line',
	kind: 'Kind',
	wholeMap: 'The whole map',
	noQuestions: 'The map passes every test of a complete map: nothing is left to ask.'
} as const;
