<script lang="ts">
	import CalendarDayCell from './CalendarDayCell.svelte';
	import { isSameMonth, shortWeekdayOf } from '$lib/data/calendarDays';
	import type { CalendarEntry } from './internalCalendar';

	let {
		weeks,
		entriesByDay,
		shownMonth,
		today
	}: { weeks: string[][]; entriesByDay: Map<string, CalendarEntry[]>; shownMonth: string | null; today: string } = $props();

	const weekdayNames = $derived(weeks[0].map(shortWeekdayOf));
	const isInShownMonth = (date: string) => shownMonth === null || isSameMonth(date, shownMonth);
</script>

<div class="grid grid-cols-1 border-t border-l border-hairline md:grid-cols-7">
	{#each weekdayNames as weekdayName (weekdayName)}
		<div class="hidden border-r border-b border-hairline px-1.5 py-1 font-display text-xs text-chalk-subtle md:block">
			{weekdayName}
		</div>
	{/each}
	{#each weeks.flat() as date (date)}
		<CalendarDayCell {date} entries={entriesByDay.get(date) ?? []} isInShownMonth={isInShownMonth(date)} isToday={date === today} />
	{/each}
</div>
