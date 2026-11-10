<script lang="ts">
	import { enhance } from '$app/forms';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import Button from '$lib/components/site/Button.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import AgendaItemFields from './AgendaItemFields.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { meetingCallFields } from '$lib/data/meetingCallForm';
	import type { ChairChoice } from '$lib/data/meetingChairChoices';

	let {
		chairChoices,
		today,
		titleMaximumLength
	}: { chairChoices: ChairChoice[]; today: string; titleMaximumLength: number } = $props();

	const tracker = new FormTracker();
	let itemKeys = $state([0]);
	let nextItemKey = 1;

	function addItem() {
		itemKeys = [...itemKeys, nextItemKey];
		nextItemKey += 1;
	}

	function removeItem(key: number) {
		itemKeys = itemKeys.filter((itemKey) => itemKey !== key);
	}
</script>

<DashboardPanel title="Call a meeting" isPadded errorMessage={tracker.errorMessage ?? ''}>
	<form method="POST" action="?/callMeeting" use:enhance={tracker.submit(undefined, { shouldKeepFields: true })} class="flex flex-col gap-4">
		<div class="grid grid-cols-2 gap-3">
			<FormField label="Day">
				<input type="date" name={meetingCallFields.date} min={today} required />
			</FormField>
			<FormField label="Time (UK)">
				<input type="time" name={meetingCallFields.time} required />
			</FormField>
		</div>
		<FormField label="Chair" hint="Every sitting director gets a to-do to brief their Claude">
			<select name={meetingCallFields.chair}>
				<option value="">I chair it myself</option>
				{#each chairChoices as choice (choice.value)}
					<option value={choice.value}>{choice.name}</option>
				{/each}
			</select>
		</FormField>
		{#each itemKeys as key, index (key)}
			<AgendaItemFields number={index + 1} {titleMaximumLength} canRemove={itemKeys.length > 1} onRemove={() => removeItem(key)} />
		{/each}
		<div class="flex flex-wrap justify-between gap-2 border-t border-hairline pt-3">
			<Button onclick={addItem}>Add an item</Button>
			<Button look="primary" type="submit" isSaving={tracker.isSaving} savingLabel="Calling…">Call the meeting</Button>
		</div>
	</form>
</DashboardPanel>
