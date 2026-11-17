<script lang="ts">
	import NewsWatchListPanel from '$lib/components/news/NewsWatchListPanel.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { newsCrumbsFor, newsTabs, newsTitle, watchListTab } from '$lib/components/news/newsPageWords';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { newsOrganisation: organisation, watchList, suggestions, canKeepWatchList } = $derived(data);
	const tabs = $derived(newsTabs(watchList.length));
	let selectedTab = $state(watchListTab);
</script>

<svelte:head>
	<title>{newsTitle} — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={newsCrumbsFor(organisation)} title={newsTitle}>
	<p class="text-sm text-chalk-subtle">
		The news that touches {organisation.name}’s business, gathered from what it watches. Only its own people and Your Business Today staff see
		it.
	</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<TabStrip {tabs} bind:selectedKey={selectedTab} />
	<NewsWatchListPanel organisationName={organisation.name} {watchList} {suggestions} canKeep={canKeepWatchList} />
</div>
