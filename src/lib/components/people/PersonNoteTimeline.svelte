<script lang="ts">
	import ProseText from '$lib/components/site/ProseText.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { inputClasses, quietButtonClasses } from '$lib/components/site/formStyles';
	import type { AuthoredNote } from '$lib/server/people/authoredNotes';
	import { personNoteKinds } from '$lib/data/personNoteKind';

	let { personId, notes }: { personId: string; notes: AuthoredNote[] } = $props();
</script>

<div class="flex flex-col gap-3">
	{#if notes.length === 0}
		<p class="text-xs text-chalk/40">Nothing noted yet.</p>
	{/if}
	{#each notes as note (note.id)}
		<article class="rounded-xl border border-hairline px-4 py-3">
			<p class="flex flex-wrap gap-x-2 text-xs text-chalk/40">
				<span>{formatBritishDate(note.createdAt)}</span>
				<span>{note.authorName}</span>
				{#if note.kind === personNoteKinds.approach}
					<span class="text-go">Drafted approach</span>
				{/if}
				{#if note.kind === personNoteKinds.research}
					<span class="text-go">Found on the web</span>
				{/if}
			</p>
			<ProseText text={note.body} class="mt-1 text-sm text-chalk/80" />
		</article>
	{/each}
	<form method="POST" action="?/addNote" class="flex flex-col gap-2">
		<input type="hidden" name="personId" value={personId} />
		<textarea
			name="body"
			rows="2"
			required
			placeholder="What did you learn?"
			aria-label="New note"
			class={`${inputClasses} text-sm`}
		></textarea>
		<div class="flex justify-end">
			<SubmitButton class={quietButtonClasses}>Add note</SubmitButton>
		</div>
	</form>
</div>
