import { describe, expect, it } from 'vitest';
import { juneBefore, productNames } from './tests/juneBeforeAndAfter';
import { lineColoursOf, lineMapOf } from './workflowLineMap';
import { legendItemsOf, productLegendItemsOf } from './workflowMapLegend';
import { stationDetailsOf } from './stationDetails';
import { trackDashesOf } from '$lib/components/lineMap/lineTrackDashes';
import { emptyVocabulary } from '$lib/data/workflowMap/phraseInDomain';
import { lineKind, type WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

const enquiry = { whatArrives: 'Subcontractor enquiry', arrivesFrom: 'a subcontractor', stationKey: 'subbie-onboarding' };
const sameAsListed = { whatArrives: 'Subcontractor details', arrivesFrom: 'the subcontractor', stationKey: 'subbie-onboarding' };

function juneWithOutsiders(): WorkflowMapVersion {
	const before = juneBefore();
	const [compliance, projectManager, ...rest] = before.lines;
	const lines = [{ ...compliance, kind: lineKind.outsideParty }, { ...projectManager, kind: lineKind.system }, ...rest];
	return { ...before, lines, arrivals: [enquiry, sameAsListed] };
}

const surroundings = (map: WorkflowMapVersion) => ({
	earlierMap: null,
	colours: lineColoursOf([map]),
	productNames,
	vocabulary: emptyVocabulary
});

const wordsOf = (items: { words: string }[]) => items.map((item) => item.words);

describe('a line kind and what arrives from outside, on the workflow map pages', () => {
	it('draws a role solid, an outside party dashed and a system dotted', () => {
		const map = juneWithOutsiders();
		const { lines } = lineMapOf(map, lineColoursOf([map]));
		expect(lines.map((line) => line.track).slice(0, 3)).toEqual(['dashed', 'dotted', 'solid']);
		expect(trackDashesOf('solid', 6)).toBeUndefined();
		expect(trackDashesOf('dashed', 6)).toBe('9 12');
	});

	it('names the other kinds in the legend only when the map draws them', () => {
		expect(wordsOf(legendItemsOf(juneBefore()))).not.toContain('A dashed line is an outside party');
		const outsiders = wordsOf(legendItemsOf(juneWithOutsiders()));
		expect(outsiders.slice(0, 3)).toEqual(['A line is a role', 'A dashed line is an outside party', 'A dotted line is a system']);
		expect(wordsOf(productLegendItemsOf(juneWithOutsiders()))).toContain('A dotted line is a system');
		expect(wordsOf(productLegendItemsOf(null))).toHaveLength(5);
	});

	it('says beside a station which kind of line it is on, and where each arrival comes from', () => {
		const map = juneWithOutsiders();
		const details = stationDetailsOf(map, surroundings(map), 'subbie-onboarding');
		expect(details?.lineKind).toBe(lineKind.outsideParty);
		expect(details?.inputs).toEqual([
			{ item: 'Subcontractor details', source: 'Arrives from the subcontractor', goesWrong: null },
			{ item: 'Trade and package', source: null, goesWrong: null },
			{ item: 'Subcontractor enquiry', source: 'Arrives from a subcontractor', goesWrong: null }
		]);
	});
});
