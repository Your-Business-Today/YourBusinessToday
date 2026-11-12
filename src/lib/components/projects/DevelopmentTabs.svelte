<script lang="ts">
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import { developmentPageLinks, type DevelopmentPage } from './developmentPages';
	import type { DevelopmentTabCounts } from './developmentTabCounts';

	let { projectId, selected, counts }: { projectId: string; selected: DevelopmentPage; counts: DevelopmentTabCounts } =
		$props();

	const tabs = $derived(developmentPageLinks(projectId, counts));
</script>

<nav aria-label="Development">
	<TabStrip {tabs} selectedKey={selected} />
</nav>
