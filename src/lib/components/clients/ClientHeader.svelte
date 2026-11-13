<script lang="ts">
	import ClientBroughtInByForm from './ClientBroughtInByForm.svelte';
	import PageTitle from '$lib/components/site/PageTitle.svelte';
	import { clientStageLabels } from '$lib/data/clientLifecycle';
	import { describeFiledFigures, type FiledFigures } from '$lib/data/filedFigures';
	import { leadSourceLabels } from '$lib/data/leadSources';
	import { companyPagePath, registerOfStage } from '$lib/data/salesRegisters';
	import type { Client } from '$lib/server/clients/clientRecord';
	import type { StaffMember } from '$lib/server/projects/getStaffDirectory';

	let {
		client,
		parent,
		figures = null,
		standing = '',
		staffMembers
	}: { client: Client; parent: Client | null; figures?: FiledFigures | null; standing?: string; staffMembers: StaffMember[] } = $props();

	const register = $derived(registerOfStage(client.stage));
</script>

<div class="flex flex-col gap-2">
	<a href={register.path} class="font-display text-sm text-chalk/50 hover:text-chalk">← {register.title}</a>
	<PageTitle>{client.name}</PageTitle>
	<p class="text-chalk/70">
		{clientStageLabels[client.stage]} · {leadSourceLabels[client.leadSource]}
		{#if parent !== null}
			· Part of <a href={companyPagePath(parent)} class="hover:text-signal">{parent.name}</a>
		{/if}
		{#if client.website !== ''}
			· <a href={client.website} class="hover:text-signal">{client.website}</a>
		{/if}
	</p>
	<ClientBroughtInByForm ownerId={client.ownerId} {staffMembers} />
	{#if standing !== ''}
		<p class="text-sm text-chalk/60">{standing}</p>
	{:else if figures !== null}
		<a href={figures.sourceUrl} target="_blank" rel="noreferrer" class="text-sm text-chalk/60 hover:text-signal">{describeFiledFigures(figures)}</a>
	{/if}
</div>
