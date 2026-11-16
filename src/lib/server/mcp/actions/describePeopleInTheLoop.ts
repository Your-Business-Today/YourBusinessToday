import { loopWords } from '$lib/data/workflowMap/productAndLoopWords';
import type { PersonInTheLoop, StepInAProduct, StepTakenOff } from '$lib/data/workflowMap/peopleInTheLoop';
import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

/** How a person's part on the map is changed, said at the end of every answer about the people in the loop. */
export const howPeopleInTheLoopChange =
	'How it changes: file the After again (file_workflow_map, stage after, every line and station carried forward with its key). ' +
	'A step comes off a person’s hands by moving, with its key, to a line of kind system; a step they still do inside a product stays ' +
	'on their line with state planned and doneIn the product’s name; a step left with state elsewhere stays theirs.';

const noBeforeSentence = 'No Before map is filed, so nothing shows as taken off their hands until one is.';

/** read_people_in_the_loop: each role of the After, what stays theirs, what they do inside our products and what is taken off their hands. */
export function describePeopleInTheLoop(organisationName: string, after: WorkflowMapVersion, people: PersonInTheLoop[], isBeforeFiled: boolean): string {
	const header = `## People in the loop on the After map of ${organisationName}, version ${after.versionNumber}`;
	const body = people.length === 0 ? loopWords.noRoles : people.map(personSection).join('\n\n');
	const beforeNote = isBeforeFiled ? [] : [noBeforeSentence];
	return [header, ...beforeNote, body, howPeopleInTheLoopChange].join('\n\n');
}

function personSection(person: PersonInTheLoop): string {
	return [
		`### ${person.roleName}`,
		`- ${loopWords.staysTheirs}: ${listed(person.staysTheirs)}`,
		`- ${loopWords.insideOurProducts}: ${listed(person.insideOurProducts.map(stepInItsProduct))}`,
		`- ${loopWords.takenOffTheirHands}: ${listed(person.takenOffTheirHands.map(stepWhereItWent))}`
	].join('\n');
}

function listed(steps: string[]): string {
	return steps.length === 0 ? loopWords.nothing.toLowerCase() : steps.join('; ');
}

function stepInItsProduct({ stationName, productName }: StepInAProduct): string {
	return `${stationName}, in ${productName}`;
}

function stepWhereItWent({ stationName, nowDoneBy }: StepTakenOff): string {
	return nowDoneBy === null ? `${stationName}, no longer on the map` : `${stationName}, now done by ${nowDoneBy}`;
}
