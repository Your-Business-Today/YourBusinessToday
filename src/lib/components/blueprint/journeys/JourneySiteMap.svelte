<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import JourneyMapPanel from './JourneyMapPanel.svelte';
	import JourneyViewsTable from './JourneyViewsTable.svelte';
	import ViewPanel from './ViewPanel.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { chosenRoleOf, chosenViewOf, journeySiteMapHref } from './journeySiteMapAddress';
	import { faultCountsOf, viewRowsOf, type ViewRow } from './journeyViewRows';
	import { faultSummary, journeySiteMapMessages } from './journeySiteMapWords';
	import { journeyColoursOf, journeyLineMapOf } from './journeyLineMap';
	import { rolesOf } from '$lib/data/journeyMap/journeyMapReading';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import type { JourneyMap } from '$lib/data/journeyMap/journeyMap';
	import type { McpMap } from '$lib/data/blueprint/mcpMap';
	import type { SiteMap } from '$lib/data/blueprint/siteMap';

	let {
		journeyMap,
		siteMap,
		mcpMap,
		projectId,
		goals
	}: { journeyMap: JourneyMap; siteMap: SiteMap | null; mcpMap: McpMap | null; projectId: string; goals: Goal[] } = $props();

	const colours = $derived(journeyColoursOf(journeyMap));
	const roles = $derived(rolesOf(journeyMap));
	const chosenView = $derived(chosenViewOf(page.url, journeyMap));
	const chosenRole = $derived(chosenRoleOf(page.url, journeyMap, chosenView));
	const lineMap = $derived(chosenRole === undefined ? null : journeyLineMapOf(journeyMap, chosenRole, colours));
	const rows = $derived(viewRowsOf(journeyMap, colours));
	const roleRoutes = $derived(new Set(lineMap === null ? [] : Object.keys(lineMap.stations)));

	function chooseView(route: string): void {
		goto(journeySiteMapHref(projectId, { role: chosenRole, route }), { noScroll: true, keepFocus: true });
	}

	function rowHref(row: ViewRow): string {
		const role = roleRoutes.has(row.route) ? chosenRole : undefined;
		return journeySiteMapHref(projectId, { role, route: row.route });
	}
</script>

{#if lineMap === null || chosenRole === undefined}
	<EmptyState message={journeySiteMapMessages.noJourneys} />
{:else}
	<JourneyMapPanel map={lineMap} {projectId} {roles} {chosenRole} selectedStationId={chosenView?.route} onChooseStation={chooseView} />
{/if}
{#if chosenView === undefined}
	<p class="text-sm text-chalk-subtle">{journeySiteMapMessages.chooseView}</p>
{:else}
	<ViewPanel view={chosenView} {journeyMap} {colours} {siteMap} {mcpMap} {goals} />
{/if}
<DashboardPanel title="Every view" count={rows.length}>
	<p class="border-b border-hairline px-6 py-3 text-sm text-chalk-muted">{faultSummary(faultCountsOf(rows))}</p>
	<JourneyViewsTable {rows} hrefOf={rowHref} />
</DashboardPanel>
