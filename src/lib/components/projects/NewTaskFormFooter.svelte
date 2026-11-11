<script lang="ts">
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import SimilarTasksNotice from './SimilarTasksNotice.svelte';
	import type { SimilarTask } from '$lib/data/similarTasks';

	let {
		errorMessage,
		similarTasks,
		isSaving,
		submitLabel,
		laterNote,
		onCancelSimilar
	}: {
		errorMessage: string | null;
		similarTasks: SimilarTask[];
		isSaving: boolean;
		submitLabel: string;
		laterNote: string;
		onCancelSimilar: () => void;
	} = $props();
</script>

<p class="text-xs text-chalk/50">{laterNote}</p>
<FormErrorNote message={errorMessage} />
{#if similarTasks.length > 0}
	<SimilarTasksNotice {similarTasks} onCancel={onCancelSimilar} />
{:else}
	<SubmitButton
		{isSaving}
		savingLabel="Adding…"
		class="self-end rounded-full bg-go px-6 py-2.5 font-display text-sm font-medium text-night
			transition hover:brightness-110"
	>
		{submitLabel}
	</SubmitButton>
{/if}
