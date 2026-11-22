<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { chatRoomLimits, type ChatRoom } from '$lib/data/chat/chatRoomRules';
	import { chatRoomPlacementRefusals } from '$lib/data/chat/chatRoomPlacement';
	import { noParentRoom, noParentRoomLabel } from './chatPageWords';

	let {
		action,
		room,
		parentChoices,
		submitLabel,
		onSaved
	}: { action: string; room: ChatRoom | null; parentChoices: ChatRoom[]; submitLabel: string; onSaved: () => void } = $props();

	const tracker = new FormTracker();
	const isGeneral = $derived(room?.isGeneral ?? false);
	const nameHint = $derived(isGeneral ? chatRoomPlacementRefusals.generalKeepsItsName : '');
	const choices = $derived(parentChoices.filter((choice) => choice.id !== room?.id));
</script>

<form method="POST" {action} use:enhance={tracker.submit(onSaved, { shouldKeepFields: true })} class="flex flex-col gap-4">
	{#if room !== null}
		<input type="hidden" name="roomId" value={room.id} />
	{/if}
	<FormField label="Name" hint={nameHint}>
		<input name="name" required maxlength={chatRoomLimits.longestName} value={room?.name ?? ''} readonly={isGeneral} autocomplete="off" />
	</FormField>
	<FormField label="What the room is for">
		<textarea name="purpose" rows="3" maxlength={chatRoomLimits.longestPurpose} value={room?.purpose ?? ''}></textarea>
	</FormField>
	{#if !isGeneral}
		<FormField label="The room it sits under">
			<select name="parentRoomId" value={room?.parentRoomId ?? noParentRoom}>
				<option value={noParentRoom}>{noParentRoomLabel}</option>
				{#each choices as choice (choice.id)}
					<option value={choice.id}>{choice.name}</option>
				{/each}
			</select>
		</FormField>
	{/if}
	<FormErrorNote message={tracker.errorMessage} />
	<Button type="submit" look="primary" isSaving={tracker.isSaving}>{submitLabel}</Button>
</form>
