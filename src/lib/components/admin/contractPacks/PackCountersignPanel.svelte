<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { companyDetails } from '$lib/data/companyDetails';
	import { contractPackSigningLimits as limits } from '$lib/data/contractPackSigningRules';
	import { packCountersigningFields as fields } from '$lib/data/contractPackCountersigningRules';

	let {
		organisationId,
		packId,
		today,
		errorMessage
	}: { organisationId: string; packId: string; today: string; errorMessage: string | null } = $props();

	let isCountersigning = $state(false);

	function countersigningPack() {
		isCountersigning = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			isCountersigning = false;
		};
	}
</script>

<section class="flex flex-col gap-3">
	<h2 class="font-display text-lg text-chalk">Countersign for {companyDetails.legalName}</h2>
	<p class="text-sm text-chalk/70">
		The client has signed every document. Countersigning keeps each one as a dated, signed PDF of the version the client
		signed, on their organisation's documents, and the pack moves to countersigned.
	</p>
	<form method="post" action="?/countersign" use:enhance={countersigningPack} class="flex flex-col gap-3">
		<input type="hidden" name="organisationId" value={organisationId} />
		<input type="hidden" name={fields.packId} value={packId} />
		<FormField label="Your name">
			<input type="text" name={fields.signerName} required maxlength={limits.longestSignerName} />
		</FormField>
		<FormField label="Your position">
			<input type="text" name={fields.signerPosition} required maxlength={limits.longestSignerPosition} />
		</FormField>
		<FormField label="Date">
			<input type="date" name={fields.signedOn} required value={today} />
		</FormField>
		<div><Button type="submit" look="primary" disabled={isCountersigning}>{isCountersigning ? 'Countersigning…' : 'Countersign'}</Button></div>
	</form>
	<FormErrorNote message={errorMessage} />
</section>
