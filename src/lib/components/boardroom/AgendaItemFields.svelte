<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { agendaPurposes } from '$lib/data/boardroomMeeting';
	import { agendaPurposeWords } from '$lib/data/describeBoardroomMeeting';
	import { meetingCallFields } from '$lib/data/meetingCallForm';

	let {
		number,
		titleMaximumLength,
		canRemove,
		onRemove
	}: { number: number; titleMaximumLength: number; canRemove: boolean; onRemove: () => void } = $props();
</script>

<fieldset class="flex flex-col gap-3 border-t border-hairline pt-3">
	<legend class="sr-only">Agenda item {number}</legend>
	<FormField label={`Item ${number}`} hint="What the board decides or notes">
		<input name={meetingCallFields.agendaTitle} required maxlength={titleMaximumLength} />
	</FormField>
	<div class="flex items-end gap-2">
		<FormField label="Purpose" class="min-w-0 flex-1">
			<select name={meetingCallFields.agendaPurpose} required>
				{#each agendaPurposes as purpose (purpose)}
					<option value={purpose}>{agendaPurposeWords[purpose]}</option>
				{/each}
			</select>
		</FormField>
		{#if canRemove}
			<Button look="ghost" label={`Remove item ${number}`} onclick={onRemove}>Remove</Button>
		{/if}
	</div>
</fieldset>
