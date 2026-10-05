<script lang="ts">
	import { formatBritishDateTime } from '$lib/data/britishDate';
	import type { WaitingTask } from '$lib/server/conversations/getTasksWaitingOnYou';

	let { waitingTask }: { waitingTask: WaitingTask } = $props();

	const sinceLabel = $derived(formatBritishDateTime(waitingTask.since));
</script>

<li>
	<a
		href={`/projects/${waitingTask.projectId}/tasks/${waitingTask.id}`}
		class="flex flex-col gap-1 px-4 py-2.5 transition hover:bg-night/40 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
	>
		<span class="flex min-w-0 flex-col gap-0.5">
			<span class="truncate font-display text-sm">{waitingTask.title}</span>
			<span class="truncate text-xs text-chalk/60">
				{waitingTask.projectName} · from {waitingTask.passedByName}
			</span>
		</span>
		<span class="flex shrink-0 items-center gap-2 font-display text-xs whitespace-nowrap text-chalk/50">
			{#if waitingTask.isForYourClaude}
				<span class="rounded-full border border-hairline px-2 py-0.5">For your Claude</span>
			{/if}
			{sinceLabel}
		</span>
	</a>
</li>
