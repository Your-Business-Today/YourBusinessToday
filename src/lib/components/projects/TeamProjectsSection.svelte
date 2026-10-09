<script lang="ts">
	import TeamProjectGrid from './TeamProjectGrid.svelte';
	import type { TeamProject } from '$lib/server/members/getTeamProjects';

	let {
		projects,
		onSetPriority
	}: { projects: TeamProject[]; onSetPriority: (project: TeamProject) => void } = $props();
</script>

<section class="flex flex-col gap-3">
	<p class="text-sm text-chalk/60">
		Projects other people own and have brought you on to, in your own order.
	</p>
	{#if projects.length === 0}
		<p class="rounded-xl border border-dashed border-hairline p-8 text-center text-sm text-chalk/60">
			Nobody has brought you on to a project yet.
		</p>
	{:else}
		<TeamProjectGrid {projects} {onSetPriority} />
	{/if}
</section>
