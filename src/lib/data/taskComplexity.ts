export type TaskComplexity = {
	viewsChanged: number;
	newViews: number;
	changesDataStructure: boolean;
	domainObjects: number;
};

/** The column limits of the four measures (migration 0115), stated once for the connector and the form. */
export const complexityCountLimits = { least: 0, most: 99 } as const;

/** How much each measure weighs: a new view is twice a changed one, a data change three. */
export const complexityWeights = {
	viewChanged: 1,
	newView: 2,
	dataStructureChange: 3,
	domainObject: 1
} as const;

/** The highest score each story point size covers, smallest first; above the last is 21, which must be split. */
const pointsByScore = [
	{ highestScore: 1, storyPoints: 1 },
	{ highestScore: 2, storyPoints: 2 },
	{ highestScore: 4, storyPoints: 3 },
	{ highestScore: 7, storyPoints: 5 },
	{ highestScore: 11, storyPoints: 8 },
	{ highestScore: 16, storyPoints: 13 }
] as const;

export const pointsToSplit = 21;

export const complexityFormula =
	'score = views changed + 2 × new views + 3 if the data structure changes + domain objects; ' +
	'up to 1 is 1 point, 2 is 2, 3–4 is 3, 5–7 is 5, 8–11 is 8, 12–16 is 13, more is 21 and must be split';

export function complexityScore(complexity: TaskComplexity): number {
	const dataChange = complexity.changesDataStructure ? complexityWeights.dataStructureChange : 0;
	return (
		complexity.viewsChanged * complexityWeights.viewChanged +
		complexity.newViews * complexityWeights.newView +
		dataChange +
		complexity.domainObjects * complexityWeights.domainObject
	);
}

export function storyPointsForComplexity(complexity: TaskComplexity): number {
	const score = complexityScore(complexity);
	const size = pointsByScore.find((band) => score <= band.highestScore);
	return size?.storyPoints ?? pointsToSplit;
}

export function mustBeSplit(storyPoints: number): boolean {
	return storyPoints >= pointsToSplit;
}

/** The measures a task row holds, or null until someone has measured it (migration 0115). */
export function parseTaskComplexity(row: Record<string, unknown>): TaskComplexity | null {
	if (typeof row.views_changed !== 'number') return null;
	return {
		viewsChanged: row.views_changed,
		newViews: Number(row.new_views ?? 0),
		changesDataStructure: row.changes_data_structure === true,
		domainObjects: Number(row.domain_objects ?? 0)
	};
}

/** "2 views changed, 1 new view, data structure changes, 3 domain objects" */
export function complexityPhrase(complexity: TaskComplexity): string {
	const dataChange = complexity.changesDataStructure ? 'data structure changes' : 'no data structure change';
	return [
		`${complexity.viewsChanged} views changed`,
		`${complexity.newViews} new views`,
		dataChange,
		`${complexity.domainObjects} domain objects`
	].join(', ');
}
