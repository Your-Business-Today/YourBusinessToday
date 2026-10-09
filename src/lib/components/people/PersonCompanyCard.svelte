<script lang="ts">
	import GroupUnderForm from '$lib/components/clients/GroupUnderForm.svelte';
	import StagePill from '$lib/components/clients/StagePill.svelte';
	import { panelClasses, quietButtonClasses } from '$lib/components/site/formStyles';
	import type { GroupParent } from '$lib/server/clients/getGroupParents';
	import type { PersonCompany } from '$lib/server/people/getCompaniesForPerson';

	let { company, parents }: { company: PersonCompany; parents: GroupParent[] } = $props();

	const researchHref = $derived(
		`/clients/research?clientId=${company.id}&query=${encodeURIComponent(company.website || company.name)}`
	);
	const part = $derived(company.officerRole || company.role);
	const otherParents = $derived(parents.filter((parent) => parent.id !== company.id));
</script>

<article class={panelClasses}>
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div class="min-w-0">
			<p class="flex flex-wrap items-center gap-2 font-display">
				<a href={`/clients/${company.id}`} class="hover:text-signal">{company.name}</a>
				<StagePill stage={company.stage} />
			</p>
			<p class="text-xs text-chalk/50">
				{[part, company.profile.companyNumber, company.profile.location].filter(Boolean).join(' · ')}
			</p>
			{#if company.parentName !== ''}
				<p class="text-xs text-chalk/40">Part of {company.parentName}</p>
			{/if}
		</div>
		<div class="flex flex-wrap items-center gap-3">
			{#if company.isResearched}
				<span class="text-xs text-go">Researched</span>
			{:else}
				<span class="text-xs text-chalk/40">Not researched yet</span>
			{/if}
			<a href={researchHref} class={quietButtonClasses}>Research</a>
		</div>
	</div>
	{#if company.parentName === ''}
		<GroupUnderForm clientId={company.id} parents={otherParents} />
	{/if}
</article>
