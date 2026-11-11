<script lang="ts">
	import { enhance } from '$app/forms';
	import { isPastDue } from '$lib/data/dueDate';
	import { saveInPlace, submitOwnForm } from '$lib/client/fieldForms';
	import { inPlaceFieldClasses } from './internalWorkStyles';

	type RecordField = { name: string; value: string };

	let {
		action,
		record,
		dueDate,
		isFinished,
		label
	}: { action: string; record: RecordField; dueDate: string | null; isFinished: boolean; label: string } = $props();

	const isLate = $derived(isPastDue(dueDate, isFinished));
</script>

<form method="POST" {action} use:enhance={saveInPlace}>
	<input type="hidden" name={record.name} value={record.value} />
	<input
		type="date"
		name="dueDate"
		value={dueDate ?? ''}
		onchange={submitOwnForm}
		aria-label={label}
		title={isLate ? 'Past its due date' : undefined}
		class={[inPlaceFieldClasses, isLate && 'font-medium text-signal']}
	/>
</form>
