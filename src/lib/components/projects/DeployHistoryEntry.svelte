<script lang="ts">
	import { formatUkDateTime } from '$lib/data/britishDate';
	import { carriedTaskPhrase, type Deploy } from '$lib/data/deployHistory';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { deploy }: { deploy: Deploy<ProjectTask> } = $props();

	const wentLive = $derived(formatUkDateTime(deploy.liveAt));
	const carried = $derived(carriedTaskPhrase(deploy.tasks));
</script>

<li class="flex min-w-0 flex-col gap-2 px-4 py-3">
	<p class="text-xs text-chalk/60">Went live {wentLive} · {carried}</p>
	<ul class="flex flex-col gap-1">
		{#each deploy.tasks as task (task.id)}
			<li>
				<a
					href={`/projects/${task.projectId}/tasks/${task.id}`}
					title={task.title}
					class="line-clamp-2 font-display text-sm leading-snug transition hover:text-go"
				>
					{task.title}
				</a>
			</li>
		{/each}
	</ul>
</li>
