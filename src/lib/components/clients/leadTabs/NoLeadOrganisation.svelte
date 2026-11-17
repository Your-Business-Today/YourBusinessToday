<script lang="ts">
	import CopyTextButton from '$lib/components/site/CopyTextButton.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import OpenLeadOrganisationButton from './OpenLeadOrganisationButton.svelte';
	import { companyPagePath } from '$lib/data/salesRegisters';
	import { noLeadOrganisationWords } from './leadOrganisationWords';
	import type { LeadCompany } from './leadTabs';

	let { company }: { company: LeadCompany } = $props();

	const words = $derived(noLeadOrganisationWords(company.name, company.id));
	const openAction = $derived(`${companyPagePath(company)}?/openOrganisation`);
</script>

<div class="flex flex-col items-center gap-3">
	<EmptyState message={words.message} />
	<div class="flex flex-wrap justify-center gap-2">
		<OpenLeadOrganisationButton action={openAction} />
		<CopyTextButton text={words.prompt} label="Copy the prompt for your Claude" />
	</div>
</div>
