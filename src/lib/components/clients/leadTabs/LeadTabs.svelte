<script lang="ts">
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import { leadTabsFor, type LeadCompany, type LeadTabKey } from './leadTabs';

	let { company, shownTab }: { company: LeadCompany; shownTab: LeadTabKey } = $props();
</script>

<nav aria-label="Their business">
	<TabStrip tabs={leadTabsFor(company)} selectedKey={shownTab} />
</nav>
