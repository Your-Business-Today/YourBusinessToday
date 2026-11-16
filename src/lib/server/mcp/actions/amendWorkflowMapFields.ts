import { workflowMapLimits as limits } from '$lib/data/workflowMap/workflowMapLimits';
import { objectSchema, textField } from '../actionTypes';
import { arrivalSchema, handoverSchema, lineFields, mapStageField, stationFields } from './workflowMapFields';

const keysField = (description: string, most: number) => ({
	type: 'array',
	items: { type: 'string' },
	description: `${description}, at most ${most}`
});

const stationPutSchema = objectSchema(
	{
		...stationFields,
		lineKey: textField('The key of the line it goes on: needed for a new station, and to move one to another line; left out, it stays where it is'),
		afterKey: textField('The key of the station on that line it follows; left out, a new or moved station goes at the end of its line')
	},
	['key', 'name', 'summary']
);

const arrivalAtSchema = objectSchema(
	{
		stationKey: textField('The key of the station it starts'),
		whatArrives: textField('What arrives, as the map names it')
	},
	['stationKey', 'whatArrives']
);

const handoverEndsSchema = objectSchema(
	{
		fromKey: textField('The key of the station that hands it over'),
		toKey: textField('The key of the station that receives it')
	},
	['fromKey', 'toKey']
);

/** What amend_workflow_map takes: the stage, what to put and the keys of what to remove; everything else is carried forward. */
export const amendWorkflowMapFields = {
	stage: mapStageField,
	lines: {
		type: 'array',
		items: objectSchema(lineFields, ['key', 'name']),
		description:
			'Lines to put: a new line goes at the end of the map and takes its stations from stations; one the map holds takes the new name and kind and keeps its stations'
	},
	stations: {
		type: 'array',
		items: stationPutSchema,
		description: 'Stations to put, whole: one whose key the map holds is replaced, and moved when it names another line or a station to follow'
	},
	handovers: {
		type: 'array',
		items: handoverSchema,
		description: 'Hand-overs to put: one joining the same two stations replaces the one held'
	},
	arrivals: {
		type: 'array',
		items: arrivalSchema,
		description: 'Arrivals to put: the same thing arriving at the same station replaces the one held'
	},
	removeStations: keysField('The keys of stations to remove; their hand-overs and arrivals go with them', limits.mostStations),
	removeLines: keysField('The keys of lines to remove, each empty once this amendment has removed or moved its stations', limits.mostLines),
	removeHandovers: {
		type: 'array',
		items: handoverEndsSchema,
		description: 'Hand-overs to remove, each by the two stations it joins'
	},
	removeArrivals: {
		type: 'array',
		items: arrivalAtSchema,
		description: 'Arrivals to remove, each by its station and what arrives'
	}
};
