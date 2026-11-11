<script lang="ts">
	import { enhance } from '$app/forms';
	import { saveInPlace, submitOwnForm } from '$lib/client/fieldForms';
	import { statusPillClasses, type StatusChoice } from './internalWorkStyles';

	type RecordField = { name: string; value: string };

	let {
		action,
		record,
		choices,
		current,
		label
	}: { action: string; record: RecordField; choices: StatusChoice[]; current: string; label: string } = $props();

	const chosen = $derived(choices.find((choice) => choice.value === current) ?? choices[0]);
</script>

<form method="POST" {action} use:enhance={saveInPlace}>
	<input type="hidden" name={record.name} value={record.value} />
	<select name="status" value={current} onchange={submitOwnForm} aria-label={label} class={statusPillClasses(chosen.tone)}>
		{#each choices as choice (choice.value)}
			<option value={choice.value}>{choice.label}</option>
		{/each}
	</select>
</form>
