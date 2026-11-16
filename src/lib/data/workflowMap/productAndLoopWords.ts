import type { ProductStage } from './productsOnTheMap';

/** What a product's stage is called: Live or Planned. */
export const productStageNames: Record<ProductStage, string> = { live: 'Live', planned: 'Planned' };

/** The words of the Products table. */
export const productWords = {
	label: 'The products we recommend, the steps each takes on and what it fixes',
	product: 'Product',
	stage: 'Live or planned',
	steps: 'Steps it takes on',
	fixes: 'What goes wrong there today',
	noSteps: 'No steps yet',
	nothingGoesWrong: 'Nothing the map says goes wrong',
	noProducts: 'The After puts no step in one of our products yet.'
} as const;

/** The words of the People in the loop table. */
export const loopWords = {
	label: 'Where each role stays in the loop',
	role: 'Role',
	staysTheirs: 'Stays theirs',
	insideOurProducts: 'Done inside our products',
	takenOffTheirHands: 'Taken off their hands',
	nothing: 'Nothing',
	noLongerDone: 'no longer done',
	noRoles: 'The After has no role lines yet.'
} as const;

/** A list of steps in one cell: each step, separated, or the word for none. */
export function stepsListed(steps: string[], noneWord: string): string {
	return steps.length === 0 ? noneWord : steps.join('; ');
}
