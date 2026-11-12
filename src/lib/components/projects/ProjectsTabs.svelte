<script lang="ts">
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import { projectsTabsFor } from './projectsTabs';
	import type { ProjectListView } from '$lib/client/projectListView.svelte';

	let { listView, waitingCount, shownTab }: { listView: ProjectListView; waitingCount: number; shownTab: string } = $props();

	const statusCounts = $derived(listView.statusCounts);
	const tabs = $derived(projectsTabsFor(waitingCount, statusCounts));
</script>

<nav aria-label="Projects">
	<TabStrip {tabs} bind:selectedKey={() => shownTab, (tab) => (listView.selectedTab = tab)} />
</nav>
