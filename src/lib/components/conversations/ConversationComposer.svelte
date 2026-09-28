<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import HandOffPicker from './HandOffPicker.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { HandOff } from '$lib/data/conversationTurn';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

	let {
		people,
		viewerId,
		suggestedHandOff
	}: { people: ProjectPerson[]; viewerId: string; suggestedHandOff: HandOff | null } = $props();

	const tracker = new FormTracker();
</script>

<FormErrorNote message={tracker.errorMessage} />
<form
	method="POST"
	action="?/postMessage"
	use:enhance={tracker.submit()}
	class="flex flex-col gap-3"
>
	<textarea
		name="body"
		required
		rows="3"
		placeholder="Say something to the people on this project — Markdown lists and links work"
		class="rounded-xl border border-hairline bg-carriage px-4 py-2.5 text-chalk outline-none
			focus:border-go"
	></textarea>
	<div class="flex flex-wrap items-center justify-between gap-3">
		<HandOffPicker {people} {viewerId} {suggestedHandOff} />
		<SubmitButton
			isSaving={tracker.isSaving}
			savingLabel="Posting…"
			class="rounded-full bg-go px-6 py-2.5 font-display text-sm font-medium text-night
				transition hover:brightness-110"
		>
			Post
		</SubmitButton>
	</div>
</form>
