<script lang="ts">
	import FeedEventPill from './FeedEventPill.svelte';
	import { formatBritishTime } from '$lib/data/britishDate';
	import { feedActorName, isFeedEventFor, type FeedEvent } from '$lib/data/feedEvent';
	import { isTaskDoneEvent } from '$lib/data/feedEventKind';

	let { event, viewerId }: { event: FeedEvent; viewerId: string } = $props();

	const timeLabel = $derived(formatBritishTime(event.createdAt));
	const actorName = $derived(feedActorName(event));
	const isYours = $derived(isFeedEventFor(event, viewerId));
	const isDone = $derived(isTaskDoneEvent(event.kind));
	const taskPath = $derived(`/projects/${event.projectId}/tasks/${event.taskId}`);
</script>

<li class={['flex items-start gap-3 px-4 py-2.5 sm:items-center', isDone && 'bg-go/5']}>
	<span class="w-12 shrink-0 pt-0.5 font-display text-xs tabular-nums text-chalk/50 sm:pt-0">{timeLabel}</span>
	<FeedEventPill kind={event.kind} />
	<span class="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
		<a href={taskPath} class="min-w-0 truncate font-display text-sm transition hover:text-go">
			{event.taskTitle}
		</a>
		<span class="flex min-w-0 shrink-0 items-center gap-2 text-xs text-chalk/60">
			<span class="truncate">{event.projectName} · {actorName}</span>
			{#if isYours}
				<span class="shrink-0 rounded-full border border-caution/60 px-2 py-0.5 font-display text-caution">
					Yours
				</span>
			{/if}
		</span>
	</span>
</li>
