import { mapStage, mapStages, type MapStage } from '$lib/data/workflowMap/workflowMap';
import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { peopleInTheLoopOf } from '$lib/data/workflowMap/peopleInTheLoop';
import { productsOnTheMap } from '$lib/data/workflowMap/productsOnTheMap';
import type { OrganisationWorkflowMaps } from '$lib/data/workflowMap/organisationWorkflowMaps';
import type { Tab } from '$lib/components/workspace/TabStrip.svelte';

/** The panes that show a table rather than a map: what changes, the products, the people in the loop and the open questions. */
export const tablePanes = ['changes', 'products', 'people', 'questions'] as const;
export type WorkflowMapTable = (typeof tablePanes)[number];

/** What the page's one row of tabs shows: the Before, the After, or one of the tables. */
export type WorkflowMapPane = MapStage | WorkflowMapTable;

export const changesPane = 'changes' satisfies WorkflowMapPane;

export const productsPane = 'products' satisfies WorkflowMapPane;

export const peoplePane = 'people' satisfies WorkflowMapPane;

export const questionsPane = 'questions' satisfies WorkflowMapPane;

const tableTabLabels: Record<WorkflowMapTable, string> = {
	changes: 'What changes',
	products: 'Products',
	people: 'People in the loop',
	questions: 'Questions'
};

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

/** The row of tabs: each map filed, What changes when there are two, Products and People in the loop once an After is filed, and Questions where the page asks them; none for one tab. */
export function workflowMapTabsOf(maps: OrganisationWorkflowMaps, changeCount: number, questionCount: number | null): Tab[] | null {
	const filedStages = mapStages.filter((stage) => maps[stage] !== null);
	const stageTabs = filedStages.map((stage) => ({ key: stage, label: mapStageNames[stage], count: null }));
	const changesTabs = isComparing(maps) ? [tableTab(changesPane, changeCount)] : [];
	const afterTabs = maps.after === null ? [] : afterTabsOf(maps);
	const questionsTabs = questionCount === null ? [] : [tableTab(questionsPane, questionCount)];
	const tabs = [...stageTabs, ...changesTabs, ...afterTabs, ...questionsTabs];
	return tabs.length > 1 ? tabs : null;
}

function afterTabsOf(maps: OrganisationWorkflowMaps): Tab[] {
	return [tableTab(productsPane, productsOnTheMap(maps).length), tableTab(peoplePane, peopleInTheLoopOf(maps).length)];
}

function tableTab(pane: WorkflowMapTable, count: number): Tab {
	return { key: pane, label: tableTabLabels[pane], count };
}

/** Whether a pane shows one of the tables. */
export function isTablePane(pane: WorkflowMapPane): pane is WorkflowMapTable {
	return (tablePanes as readonly string[]).includes(pane);
}

/** The map a pane draws, or null for a table. */
export function shownStageOf(pane: WorkflowMapPane): MapStage | null {
	if (isTablePane(pane)) return null;
	return pane;
}
