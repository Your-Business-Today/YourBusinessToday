<script lang="ts">
	import CalendarEntryLink from './CalendarEntryLink.svelte';
	import { dayOfMonthOf, dayTitleOf } from '$lib/data/calendarDays';
	import type { CalendarEntry } from './internalCalendar';

	let {
		date,
		entries,
		isInShownMonth,
		isToday
	}: { date: string; entries: CalendarEntry[]; isInShownMonth: boolean; isToday: boolean } = $props();
</script>

<div
	aria-current={isToday ? 'date' : undefined}
	class={[
		'flex min-h-12 min-w-0 flex-col gap-1 border-r border-b border-hairline p-1.5 md:min-h-24',
		!isInShownMonth && 'bg-night/30 opacity-60'
	]}
>
	<span class={['font-display text-xs', isToday ? 'font-semibold text-go' : 'text-chalk-subtle']}>
		<span class="md:hidden">{dayTitleOf(date)}</span>
		<span class="hidden md:inline">{dayOfMonthOf(date)}</span>
	</span>
	{#each entries as entry (entry.id)}
		<CalendarEntryLink {entry} />
	{/each}
</div>
