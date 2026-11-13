import { mapStage, mapStages, type MapStage } from '$lib/data/workflowMap/workflowMap';
import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import type { OrganisationWorkflowMaps } from '$lib/data/workflowMap/organisationWorkflowMaps';
import type { Tab } from '$lib/components/workspace/TabStrip.svelte';

/** What the page's one row of tabs shows: the Before, the After, the table of what changes, or the map's open questions. */
export type WorkflowMapPane = MapStage | 'changes' | 'questions';

export const changesPane = 'changes' satisfies WorkflowMapPane;

export const questionsPane = 'questions' satisfies WorkflowMapPane;

const changesTabLabel = 'What changes';

const questionsTabLabel = 'Questions';

/** The map the page opens on: today's, which is the After when one is filed, else the Before; none before the first filing. */
export function openingStageOf(maps: OrganisationWorkflowMaps): MapStage | null {
	if (maps.after !== null) return mapStage.after;
	if (maps.before !== null) return mapStage.before;
	return null;
}

/** Whether the page compares a Before with an After. */
export function isComparing(maps: OrganisationWorkflowMaps): boolean {
	return maps.before !== null && maps.after !== null;
}

/** The row of tabs: each map filed, What changes when there are two, and Questions with its count where the page asks them; none for one tab. */
export function workflowMapTabsOf(maps: OrganisationWorkflowMaps, changeCount: number, questionCount: number | null): Tab[] | null {
	const filedStages = mapStages.filter((stage) => maps[stage] !== null);
	const stageTabs = filedStages.map((stage) => ({ key: stage, label: mapStageNames[stage], count: null }));
	const changesTabs = isComparing(maps) ? [{ key: changesPane, label: changesTabLabel, count: changeCount }] : [];
	const questionsTabs = questionCount === null ? [] : [{ key: questionsPane, label: questionsTabLabel, count: questionCount }];
	const tabs = [...stageTabs, ...changesTabs, ...questionsTabs];
	return tabs.length > 1 ? tabs : null;
}

/** The map a pane draws, or null for a table. */
export function shownStageOf(pane: WorkflowMapPane): MapStage | null {
	if (pane === changesPane || pane === questionsPane) return null;
	return pane;
}
