<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import CalendarGrid from './CalendarGrid.svelte';
	import CalendarNavigation from './CalendarNavigation.svelte';
	import UndatedEntries from './UndatedEntries.svelte';
	import { addMonths, addWeeks, dayTitleOf, monthTitleOf, monthWeeksOf, weekOf, weekStartOf } from '$lib/data/calendarDays';
	import { ukClockAt } from '$lib/data/ukClock';
	import { internalCalendarOf } from './internalCalendar';
	import type { InternalItem } from './internalWorkGroups';
	import type { Todo } from '$lib/server/todos/todoRecord';

	let { items, todosByTask }: { items: InternalItem[]; todosByTask: Record<string, Todo[]> } = $props();

	const wideEnoughForAMonth = '(min-width: 48rem)';
	const backwards = -1;
	const forwards = 1;

	const today = ukClockAt(new Date()).date;
	let shownDate = $state(today);
	const isMonthShown = new MediaQuery(wideEnoughForAMonth, true);
	const calendar = $derived(internalCalendarOf(items, todosByTask));
	const weeks = $derived(isMonthShown.current ? monthWeeksOf(shownDate) : [weekOf(shownDate)]);
	const title = $derived(isMonthShown.current ? monthTitleOf(shownDate) : `Week of ${dayTitleOf(weekStartOf(shownDate))}`);
	const stepName = $derived(isMonthShown.current ? 'month' : 'week');

	function step(direction: number) {
		shownDate = isMonthShown.current ? addMonths(shownDate, direction) : addWeeks(shownDate, direction);
	}
</script>

<div class="grid lg:grid-cols-[minmax(0,1fr)_16rem]">
	<div class="flex min-w-0 flex-col">
		<CalendarNavigation
			{title}
			{stepName}
			onPrevious={() => step(backwards)}
			onToday={() => (shownDate = today)}
			onNext={() => step(forwards)}
		/>
		<CalendarGrid {weeks} entriesByDay={calendar.entriesByDay} shownMonth={isMonthShown.current ? shownDate : null} {today} />
	</div>
	<UndatedEntries entries={calendar.undatedEntries} />
</div>
