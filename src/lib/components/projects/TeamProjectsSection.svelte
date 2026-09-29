<script lang="ts">
	import TeamProjectGrid from './TeamProjectGrid.svelte';
	import type { TeamProject } from '$lib/server/members/getTeamProjects';

	let {
		projects,
		onSetPriority
	}: { projects: TeamProject[]; onSetPriority: (project: TeamProject) => void } = $props();
</script>

{#if projects.length > 0}
	<section class="flex flex-col gap-4 pt-8">
		<div class="flex flex-col gap-1">
			<h2 class="font-display text-2xl font-medium">Team projects</h2>
			<p class="text-chalk/70">
				Projects other people own and have brought you on to, in your own order.
			</p>
		</div>
		<TeamProjectGrid {projects} {onSetPriority} />
	</section>
{/if}
