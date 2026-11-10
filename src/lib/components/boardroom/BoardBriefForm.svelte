<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { boardBriefFields, boardBriefParts } from '$lib/data/boardBriefForm';
	import { boardBriefLimits } from '$lib/data/boardroomBriefRules';
	import type { OwnBriefView } from '$lib/data/boardBriefViews';

	let { itemNumber, ownBrief }: { itemNumber: number; ownBrief: OwnBriefView | null } = $props();

	const tracker = new FormTracker();
	const hasBriefed = $derived(ownBrief !== null);

	function writtenSoFar(part: keyof OwnBriefView): string {
		if (ownBrief === null) return '';
		return String(ownBrief[part] ?? '');
	}
</script>

<form method="POST" action="?/briefItem" use:enhance={tracker.submit(undefined, { shouldKeepFields: true })} class="flex flex-col gap-3">
	<input type="hidden" name={boardBriefFields.itemNumber} value={itemNumber} />
	{#each boardBriefParts as part (part.name)}
		<FormField label={part.label} hint={part.hint}>
			<textarea
				name={part.name}
				rows="3"
				required={part.isRequired}
				maxlength={boardBriefLimits.longestPart}
				value={writtenSoFar(part.name)}
			></textarea>
		</FormField>
	{/each}
	{#if tracker.errorMessage !== null}
		<p class="text-sm font-medium text-signal">{tracker.errorMessage}</p>
	{/if}
	<div class="flex justify-end">
		<Button look="primary" type="submit" isSaving={tracker.isSaving}>
			{hasBriefed ? 'Save as a new version' : 'Save my brief'}
		</Button>
	</div>
</form>
