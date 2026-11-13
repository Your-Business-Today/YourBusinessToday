import { workflowMapLimits as limits } from '$lib/data/workflowMap/workflowMapLimits';
import { mapStages, stationStates } from '$lib/data/workflowMap/workflowMap';
import { objectSchema, textField } from '../actionTypes';

export const mapStageField = {
	type: 'string',
	enum: [...mapStages],
	description: 'before (the business as we find it) or after (the business with our products in it)'
};

const wordsField = (description: string, limit: number) => ({
	type: 'array',
	items: { type: 'string' },
	description: `${description}, at most ${limits.mostWordsInAList}, each at most ${limit} characters`
});

const stationSchema = objectSchema(
	{
		key: textField(`Your own key for the task, lower-case words joined by hyphens, at most ${limits.keyLength} characters; keep it in every version and in Before and After`),
		name: textField(`What the business calls the task, at most ${limits.nameLength} characters`),
		summary: textField(`One sentence on it, at most ${limits.summaryLength} characters`),
		takesIn: wordsField('What it takes in, as kinds of record', limits.wordLength),
		produces: wordsField('What it produces, as kinds of record', limits.wordLength),
		doneIn: textField(`Where it is done: a product, a spreadsheet, email, paper; at most ${limits.doneInLength} characters`),
		isOutput: { type: 'boolean', description: 'true when it produces an output the business runs on, such as a cashflow forecast' },
		state: { type: 'string', enum: [...stationStates], description: 'ours (done in one of our products), planned (for one) or elsewhere; elsewhere when left out' },
		productId: textField('With ours or planned: the id of the product, as list_projects gives it'),
		takesInThings: wordsField("The slugs of the Domain things it takes in, as the organisation's Domain names them", limits.thingSlugLength),
		producesThings: wordsField('The slugs of the Domain things it produces', limits.thingSlugLength)
	},
	['key', 'name', 'summary']
);

const lineSchema = objectSchema(
	{
		key: textField(`Your own key for the role, lower-case words joined by hyphens, at most ${limits.keyLength} characters`),
		name: textField(`The role, as a hat someone wears, never a person; at most ${limits.nameLength} characters`),
		stations: {
			type: 'array',
			items: stationSchema,
			description: `The tasks this role does, in the order they are done, at most ${limits.mostStationsOnALine}`
		}
	},
	['key', 'name', 'stations']
);

const handoverSchema = objectSchema(
	{
		fromKey: textField('The key of the station that hands it over'),
		toKey: textField('The key of the station on another line that receives it'),
		handedOver: textField(`What is handed over, at most ${limits.handedOverLength} characters`),
		goesWrong: textField(`Only where it goes wrong today: one sentence saying how, at most ${limits.goesWrongLength} characters`)
	},
	['fromKey', 'toKey', 'handedOver']
);

export const workflowMapFields = {
	stage: mapStageField,
	lines: { type: 'array', items: lineSchema, description: `Every role, at most ${limits.mostLines}, ${limits.mostStations} stations in all` },
	handovers: { type: 'array', items: handoverSchema, description: `What passes between lines, at most ${limits.mostHandovers}` }
};
