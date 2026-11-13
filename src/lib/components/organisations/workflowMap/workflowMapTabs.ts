import { mapStage, type MapStage } from '$lib/data/workflowMap/workflowMap';
import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import type { OrganisationWorkflowMaps } from '$lib/data/workflowMap/organisationWorkflowMaps';
import type { Tab } from '$lib/components/workspace/TabStrip.svelte';

/** What the page's one row of tabs shows: the Before, the After, or the table of what changes between them. */
export type WorkflowMapPane = MapStage | 'changes';

export const changesPane = 'changes' satisfies WorkflowMapPane;

const changesTabLabel = 'What changes';

/** The map the page opens on: today's, which is the After when one is filed, else the Before; none before the first filing. */
export function openingStageOf(maps: OrganisationWorkflowMaps): MapStage | null {
	if (maps.after !== null) return mapStage.after;
	if (maps.before !== null) return mapStage.before;
	return null;
}

/** Whether the page compares a Before with an After, and so shows its row of tabs. */
export function isComparing(maps: OrganisationWorkflowMaps): boolean {
	return maps.before !== null && maps.after !== null;
}

/** The row of tabs: Before, After and What changes with its count. */
export function workflowMapTabsOf(changeCount: number): Tab[] {
	return [
		{ key: mapStage.before, label: mapStageNames.before, count: null },
		{ key: mapStage.after, label: mapStageNames.after, count: null },
		{ key: changesPane, label: changesTabLabel, count: changeCount }
	];
}

/** The map a pane draws, or null for the table of what changes. */
export function shownStageOf(pane: WorkflowMapPane): MapStage | null {
	if (pane === changesPane) return null;
	return pane;
}
