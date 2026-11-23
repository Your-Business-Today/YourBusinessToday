<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { ChatRoom } from '$lib/data/chat/chatRoomRules';

	let { room, onArchived }: { room: ChatRoom; onArchived: () => void } = $props();

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/archiveRoom" use:enhance={tracker.submit(onArchived)} class="mt-6 flex flex-col gap-3 border-t border-hairline pt-4">
	<input type="hidden" name="roomId" value={room.id} />
	<p class="text-sm text-chalk-subtle">
		Archiving takes {room.name} off the list of rooms. It archives nothing else, so a room with subrooms is archived once they are.
	</p>
	<FormErrorNote message={tracker.errorMessage} />
	<Button type="submit" isDestructive isSaving={tracker.isSaving} savingLabel="Archiving…">Archive room</Button>
</form>
