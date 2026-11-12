<script lang="ts">
	import { enhance } from '$app/forms';
	import { isPastDue } from '$lib/data/dueDate';
	import { openDatePicker } from '$lib/client/datePicker';
	import { saveInPlace, submitOwnForm } from '$lib/client/fieldForms';
	import { dateFieldClasses, emptyDateFieldClasses, inPlaceFieldClasses } from './internalWorkStyles';

	type RecordField = { name: string; value: string };

	let {
		action,
		record,
		dueDate,
		isFinished,
		label
	}: { action: string; record: RecordField; dueDate: string | null; isFinished: boolean; label: string } = $props();

	const isLate = $derived(isPastDue(dueDate, isFinished));
	const isEmpty = $derived(dueDate === null);
</script>

<form method="POST" {action} use:enhance={saveInPlace} class="relative w-fit">
	<input type="hidden" name={record.name} value={record.value} />
	<input
		type="date"
		name="dueDate"
		value={dueDate ?? ''}
		onchange={submitOwnForm}
		onclick={openDatePicker}
		aria-label={label}
		title={isLate ? 'Past its due date' : undefined}
		class={['peer', inPlaceFieldClasses, dateFieldClasses, isEmpty && emptyDateFieldClasses, isLate && 'font-medium text-signal']}
	/>
	{#if isEmpty}
		<span aria-hidden="true" class="pointer-events-none absolute inset-y-0 left-1.5 flex items-center text-sm text-chalk-subtle/60 peer-hover:text-chalk-subtle peer-focus:hidden">
			Add date
		</span>
	{/if}
</form>
