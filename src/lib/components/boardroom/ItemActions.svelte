<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import BoardActionEntry from './BoardActionEntry.svelte';
	import BoardActionForm from './BoardActionForm.svelte';
	import type { ItemActionsView } from '$lib/data/boardActionViews';

	let { actions, itemNumber }: { actions: ItemActionsView; itemNumber: number } = $props();

	const raising = new FormTracker();
	const entries = $derived(actions.entries);
</script>

{#if entries.length > 0 || actions.canRecord}
	<section class="flex flex-col gap-2 border-l-2 border-hairline-strong pl-3" aria-label="The actions">
		<p class="text-sm font-medium text-chalk">Actions, confirmed with the decision</p>
		{#if entries.length > 0}
			<ul class="flex flex-col gap-2">
				{#each entries as action (action.id)}
					<BoardActionEntry {action} />
				{/each}
			</ul>
		{/if}
		{#if actions.canRaiseAgain}
			<form method="POST" action="?/raiseActions" use:enhance={raising.submit()}>
				<Button type="submit" isSaving={raising.isSaving}>Raise what is not on its board</Button>
			</form>
		{/if}
		{#if raising.errorMessage !== null}
			<p class="text-sm font-medium text-signal">{raising.errorMessage}</p>
		{/if}
		{#if actions.canRecord}
			<BoardActionForm {itemNumber} />
		{/if}
	</section>
{/if}
