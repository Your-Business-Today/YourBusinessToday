<script lang="ts">
	import PersonCompanyCard from './PersonCompanyCard.svelte';
	import { quietButtonClasses } from '$lib/components/site/formStyles';
	import type { GroupParent } from '$lib/server/clients/getGroupParents';
	import type { PersonCompany } from '$lib/server/people/getCompaniesForPerson';

	let {
		companies,
		parents,
		canImport
	}: { companies: PersonCompany[]; parents: GroupParent[]; canImport: boolean } = $props();
</script>

<section class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h2 class="font-display text-xl">Companies</h2>
		{#if canImport}
			<a href="?import=companies" class={quietButtonClasses}>Import their other companies</a>
		{/if}
	</div>
	{#if companies.length === 0}
		<p class="text-sm text-chalk/50">No company yet.</p>
	{/if}
	{#each companies as company (company.contactId)}
		<PersonCompanyCard {company} {parents} />
	{/each}
</section>
