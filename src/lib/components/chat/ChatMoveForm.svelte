<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { chosenCountRefusal } from '$lib/data/chat/validateChatMove';
	import { subroomIndent } from './chatPageWords';
	import type { ListedChatRoom } from '$lib/data/chat/chatRoomTree';

	let {
		roomName,
		chosenIds,
		destinations,
		onMoved
	}: { roomName: string; chosenIds: string[]; destinations: ListedChatRoom[]; onMoved: () => void } = $props();

	const tracker = new FormTracker();
	const nowhereToGo = 'This organisation has no other open room to move them to.';
	const hasNowhereToGo = $derived(destinations.length === 0);
	const choiceRefusal = $derived(chosenCountRefusal(chosenIds.length) ?? (hasNowhereToGo ? nowhereToGo : null));
	const shownRefusal = $derived(tracker.errorMessage ?? choiceRefusal);
	const canMove = $derived(choiceRefusal === null);

	function optionLabel(room: ListedChatRoom): string {
		if (room.isSubroom) return `${subroomIndent}${room.name}`;
		return room.name;
	}
</script>

<form method="POST" action="?/moveMessages" use:enhance={tracker.submit(onMoved, { shouldKeepFields: true })} class="flex flex-col gap-4">
	{#each chosenIds as messageId (messageId)}
		<input type="hidden" name="messageId" value={messageId} />
	{/each}
	<p class="text-sm text-chalk-subtle">
		{chosenIds.length} chosen in {roomName}. They keep who said them and when, a line here says where they went, and a move back undoes it.
	</p>
	<FormField label="The room to move them to">
		<select name="toRoomId" required disabled={hasNowhereToGo}>
			{#each destinations as room (room.id)}
				<option value={room.id}>{optionLabel(room)}</option>
			{/each}
		</select>
	</FormField>
	<FormErrorNote message={shownRefusal} />
	<Button type="submit" look="primary" isSaving={tracker.isSaving} savingLabel="Moving…" disabled={!canMove}>
		Move them
	</Button>
</form>
