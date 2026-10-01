<script lang="ts">
	import TeamProjectGrid from './TeamProjectGrid.svelte';
	import type { TeamProject } from '$lib/server/members/getTeamProjects';

	let {
		projects,
		onSetPriority
	}: { projects: TeamProject[]; onSetPriority: (project: TeamProject) => void } = $props();
</script>

{#if projects.length > 0}
	<section class="flex flex-col gap-3 pt-4">
		<div class="flex flex-col gap-0.5">
			<h2 class="font-display text-xs tracking-widest text-chalk/60 uppercase">Team projects</h2>
			<p class="text-sm text-chalk/60">
				Projects other people own and have brought you on to, in your own order.
			</p>
		</div>
		<TeamProjectGrid {projects} {onSetPriority} />
	</section>
{/if}
