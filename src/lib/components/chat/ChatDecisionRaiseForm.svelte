<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import ProseText from '$lib/components/site/ProseText.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { chatDecisionLimits, type ChatPerson } from '$lib/data/chat/chatDecisionRules';
	import type { ChatRoomMessage } from '$lib/server/chat/readChatFlowOfRoom';

	let { message, people, onRaised }: { message: ChatRoomMessage; people: ChatPerson[]; onRaised: () => void } = $props();

	const tracker = new FormTracker();
	const hasWords = $derived(message.body !== '');
</script>

<form method="POST" action="?/raiseDecision" use:enhance={tracker.submit(onRaised, { shouldKeepFields: true })} class="flex flex-col gap-4">
	<input type="hidden" name="messageId" value={message.id} />
	<div class="flex flex-col gap-1 text-sm text-chalk-subtle">
		<p>From {message.authorName}’s message:</p>
		{#if hasWords}
			<ProseText text={message.body} class="text-chalk/90" />
		{/if}
	</div>
	<FormField label="The decision to be taken">
		<textarea name="wording" rows="3" required maxlength={chatDecisionLimits.longestWording}></textarea>
	</FormField>
	<FormField label="Who it waits on">
		<select name="waitingOn" required>
			{#each people as person (person.id)}
				<option value={person.id}>{person.name}</option>
			{/each}
		</select>
	</FormField>
	<FormErrorNote message={tracker.errorMessage} />
	<Button type="submit" look="primary" isSaving={tracker.isSaving} savingLabel="Raising…">Raise the decision</Button>
</form>
