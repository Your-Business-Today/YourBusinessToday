<script lang="ts">
	import AddLeadForm from '$lib/components/clients/AddLeadForm.svelte';
	import FollowUpsPanel from '$lib/components/people/FollowUpsPanel.svelte';
	import SalesRegisterPage from '$lib/components/salesRegisters/SalesRegisterPage.svelte';
	import { headerButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import { leadsRegister } from '$lib/data/salesRegisters';

	let { data, form } = $props();

	const { followUpsDue, today } = $derived(data);

	const findingTools = [
		{ href: '/clients/research', label: 'Research with your Claude' },
		{ href: '/clients/prospect', label: 'Search Companies House' },
		{ href: '/clients/map', label: 'Map an area' },
		{ href: '/clients/patches', label: 'Territories' },
		{ href: '/clients/feed', label: 'Territory feed' },
		{ href: '/people', label: 'People' }
	];
</script>

<SalesRegisterPage register={leadsRegister} reading={data} message={form?.message ?? null}>
	{#snippet actions()}
		{#each findingTools as tool (tool.href)}
			<a href={tool.href} class={headerButtonClasses}>{tool.label}</a>
		{/each}
	{/snippet}
	{#if followUpsDue.length > 0}
		<FollowUpsPanel followUps={followUpsDue} {today} />
	{/if}
	<AddLeadForm staffMembers={data.staffMembers} viewerId={data.viewerId} />
</SalesRegisterPage>
