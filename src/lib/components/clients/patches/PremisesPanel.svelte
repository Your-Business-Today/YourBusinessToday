<script lang="ts">
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { confirmButtonClasses, quietButtonClasses } from '$lib/components/site/formStyles';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { premisesSourceLabels } from '$lib/data/foodHygieneRules';
	import type { Premises } from '$lib/server/premises/premisesRecord';

	let { premises, patchId }: { premises: Premises; patchId: string } = $props();

	const rating = $derived(ratingSentence(premises));

	function ratingSentence(one: Premises): string {
		const value = one.ratingValue === '' ? 'No rating yet' : `Rating ${one.ratingValue}`;
		const when = one.ratingDate === null ? '' : ` on ${formatBritishDate(one.ratingDate)}`;
		const pending = one.isNewRatingPending ? ' · new rating pending' : '';
		return `${value}${when}${pending}`;
	}
</script>

<aside class="flex flex-col gap-4 rounded-2xl border border-hairline bg-carriage p-5">
	<div class="flex flex-col gap-1">
		<h2 class="font-display text-xl font-medium">{premises.businessName}</h2>
		<p class="text-sm text-chalk/70">{premises.address === '' ? premises.sector : `${premises.address} · ${premises.sector}`}</p>
		<p class="text-xs text-chalk/50">{premises.businessType === '' ? '' : `${premises.businessType} · `}{rating}</p>
		<a href={premises.sourceUrl} target="_blank" rel="noreferrer" class="text-xs text-chalk/50 hover:text-signal">
			Listed by {premisesSourceLabels[premises.source]}, first seen {formatBritishDate(premises.firstSeenAt)}
		</a>
	</div>
	{#if premises.clientId !== null}
		<a href={`/clients/${premises.clientId}`} class={quietButtonClasses}>Open the client</a>
	{:else}
		<form method="POST" action="?/addPremisesAsLead">
			<input type="hidden" name="patchId" value={patchId} />
			<input type="hidden" name="premisesId" value={premises.id} />
			<SubmitButton class={confirmButtonClasses} savingLabel="Adding…">Add as lead</SubmitButton>
		</form>
	{/if}
</aside>
