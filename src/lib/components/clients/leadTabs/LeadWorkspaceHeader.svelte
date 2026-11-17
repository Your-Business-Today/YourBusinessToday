<script lang="ts">
	import LeadTabs from './LeadTabs.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { leadTabCrumbs, leadTabLabels, type LeadCompany, type LeadTabKey } from './leadTabs';
	import type { Snippet } from 'svelte';

	let { company, shownTab, actions, children }: { company: LeadCompany; shownTab: LeadTabKey; actions?: Snippet; children?: Snippet } = $props();
</script>

<WorkspaceHeader crumbs={leadTabCrumbs(company)} title={leadTabLabels[shownTab]} {actions} {children}>
	{#snippet tabs()}
		<LeadTabs {company} {shownTab} />
	{/snippet}
</WorkspaceHeader>
