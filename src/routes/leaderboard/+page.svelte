<script lang="ts">
	import SalesLeaderboardTable from '$lib/components/salesRegisters/SalesLeaderboardTable.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { leaderboardLink } from '$lib/components/site/siteNavigation';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();
</script>

<svelte:head>
	<title>{leaderboardLink.label} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={[]} title={leaderboardLink.label}>
	<p class="text-sm text-chalk-subtle">Who brought in each lead, and how many became clients.</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<SalesLeaderboardTable standings={data.standings} />
</div>
