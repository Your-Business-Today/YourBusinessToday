import { combinedMap } from '$lib/components/lineMap/layout/combinedMap';
import { layoutLineMap } from '$lib/components/lineMap/layout/layoutLineMap';
import { lineColoursOf, lineMapOf } from './workflowLineMap';
import type { LineColour, LineMapModel } from '$lib/components/lineMap/layout/lineMapModel';
import type { LineMapLayout } from '$lib/components/lineMap/layout/lineMapLayout';
import type { MeasureText } from '$lib/components/lineMap/layout/textMeasure';
import type { MapStage } from '$lib/data/workflowMap/workflowMap';
import type { OrganisationWorkflowMaps } from '$lib/data/workflowMap/organisationWorkflowMaps';

/** The filed maps as the line map draws them, each role in one colour, laid out together so a station keeps its place. */
export type DrawnWorkflowMaps = {
	colours: Map<string, LineColour>;
	lineMaps: Record<MapStage, LineMapModel | null>;
	layout: LineMapLayout;
};

export function drawnWorkflowMapsOf(maps: OrganisationWorkflowMaps, measure: MeasureText): DrawnWorkflowMaps {
	const { before, after } = maps;
	const filed = [before, after].filter((version) => version !== null);
	const colours = lineColoursOf(filed);
	const lineMaps = {
		before: before === null ? null : lineMapOf(before, colours),
		after: after === null ? null : lineMapOf(after, colours)
	};
	const drawn = [lineMaps.before, lineMaps.after].filter((lineMap) => lineMap !== null);
	return { colours, lineMaps, layout: layoutLineMap(combinedMap(drawn), { measure }) };
}
