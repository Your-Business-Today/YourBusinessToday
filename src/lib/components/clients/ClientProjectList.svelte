<script lang="ts">
	import type { ClientProject } from '$lib/server/clients/getProjectsForClient';

	let { projects }: { projects: ClientProject[] } = $props();
</script>

<ul class="divide-y divide-hairline rounded-2xl border border-hairline">
	{#each projects as project (project.id)}
		<li class="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
			<div class="min-w-0">
				<a href={`/projects/${project.id}`} class="font-display hover:text-signal">{project.name}</a>
				<p class="truncate text-xs text-chalk/50">
					{project.repositoryUrl === '' ? 'No repository recorded' : project.repositoryUrl}
				</p>
			</div>
			{#if project.awaitingAnswerCount > 0}
				<span class="text-xs text-signal">{project.awaitingAnswerCount} awaiting an answer</span>
			{/if}
		</li>
	{/each}
</ul>
