<script lang="ts">
	import WaitingTaskRow from './WaitingTaskRow.svelte';
	import { panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { WaitingTask } from '$lib/server/conversations/getTasksWaitingOnYou';

	let { waitingTasks }: { waitingTasks: WaitingTask[] } = $props();
</script>

{#if waitingTasks.length > 0}
	<section class="flex flex-col gap-3">
		<div class="flex items-baseline justify-between gap-3">
			<div class="flex flex-col gap-0.5">
				<h2 class="font-display text-xs tracking-widest text-signal uppercase">Waiting on you</h2>
				<p class="text-sm text-chalk/60">
					Tasks across all your projects where the latest message is waiting on your reply, the
					longest wait first.
				</p>
			</div>
			<span class="shrink-0 font-display text-sm text-signal">{waitingTasks.length}</span>
		</div>
		<ul class="{panelListClasses} rounded-xl border border-signal/40 bg-carriage">
			{#each waitingTasks as waitingTask (waitingTask.id)}
				<WaitingTaskRow {waitingTask} />
			{/each}
		</ul>
	</section>
{/if}
