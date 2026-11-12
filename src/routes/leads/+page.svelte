<script lang="ts">
	import AddLeadForm from '$lib/components/clients/AddLeadForm.svelte';
	import SalesRegisterPage from '$lib/components/salesRegisters/SalesRegisterPage.svelte';
	import { headerButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import { leadsRegister } from '$lib/data/salesRegisters';

	let { data, form } = $props();

	const findingTools = [
		{ href: '/clients/research', label: 'Research with your Claude' },
		{ href: '/clients/prospect', label: 'Search Companies House' },
		{ href: '/clients/map', label: 'Map an area' },
		{ href: '/clients/patches', label: 'Patches' },
		{ href: '/clients/feed', label: 'Patch feed' },
		{ href: '/people', label: 'People' }
	];
</script>

<SalesRegisterPage register={leadsRegister} reading={data} message={form?.message ?? null}>
	{#snippet actions()}
		{#each findingTools as tool (tool.href)}
			<a href={tool.href} class={headerButtonClasses}>{tool.label}</a>
		{/each}
	{/snippet}
	<AddLeadForm />
</SalesRegisterPage>
