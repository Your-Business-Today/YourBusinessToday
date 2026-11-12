<script lang="ts">
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import { priorityTab, projectsTabsFor, statusFilterOfTab } from './projectsTabs';
	import type { ProjectListView } from '$lib/client/projectListView.svelte';

	let {
		listView,
		waitingCount,
		showsPriority,
		onPriorityChosen
	}: {
		listView: ProjectListView;
		waitingCount: number;
		showsPriority: boolean;
		onPriorityChosen: (isChosen: boolean) => void;
	} = $props();

	const statusCounts = $derived(listView.statusCounts);
	const tabs = $derived(projectsTabsFor(waitingCount, statusCounts));
	const selectedKey = $derived(showsPriority ? priorityTab : listView.selectedStatus);

	function chooseTab(key: string) {
		const status = statusFilterOfTab(key);
		onPriorityChosen(status === null);
		if (status !== null) listView.selectedStatus = status;
	}
</script>

<nav aria-label="Projects">
	<TabStrip {tabs} bind:selectedKey={() => selectedKey, chooseTab} />
</nav>
