<script lang="ts">
	import { taskPagePath, taskSheet } from '$lib/client/taskSheet.svelte';
	import type { CalendarEntry } from './internalCalendar';

	let { entry }: { entry: CalendarEntry } = $props();

	const kindWord = $derived(entry.isTodo ? 'To-do' : 'Item');
	const standingWord = $derived(entry.isOverdue ? ', overdue' : '');
	const description = $derived(`${kindWord}${standingWord}: ${entry.title}`);
</script>

<a
	href={taskPagePath(entry.opens)}
	onclick={(event) => taskSheet.openOnPlainClick(event, entry.opens)}
	title={description}
	aria-label={description}
	class={[
		'flex min-w-0 items-center gap-1.5 rounded px-1.5 py-0.5 text-xs transition hover:bg-carriage-raised',
		entry.isOverdue ? 'bg-signal/10 font-medium text-signal' : 'text-chalk-muted',
		entry.isFinished && 'text-chalk-faint line-through'
	]}
>
	<span aria-hidden="true" class={['shrink-0 border border-current', entry.isTodo ? 'h-2.5 w-2.5 rounded-xs' : 'h-1.5 w-1.5 rounded-full bg-current']}></span>
	<span class="truncate">{entry.title}</span>
</a>
