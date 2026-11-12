<script lang="ts">
	import ClientTable from '$lib/components/clients/ClientTable.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import RegisterStageTabs from './RegisterStageTabs.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import type { SalesRegister } from '$lib/data/salesRegisters';
	import type { SalesRegisterReading } from '$lib/server/salesRegisters/loadSalesRegister';
	import type { Snippet } from 'svelte';

	let {
		register,
		reading,
		message,
		actions,
		children
	}: {
		register: SalesRegister;
		reading: SalesRegisterReading;
		message: string | null;
		actions?: Snippet;
		children?: Snippet;
	} = $props();

	const emptyMessage = 'Nobody at this stage yet.';
	const { clients } = $derived(reading);
</script>

<svelte:head>
	<title>{register.title} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={[]} title={register.title} {actions}>
	<p class="text-sm text-chalk-subtle">{register.description}</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<nav aria-label="Stages">
		<RegisterStageTabs
			{register}
			chosenStage={reading.stage}
			stageCounts={reading.stageCounts}
			totalCount={reading.totalCount}
		/>
	</nav>
	<FormErrorNote {message} />
	{@render children?.()}
	{#if clients.length === 0}
		<EmptyState message={emptyMessage} />
	{:else}
		<ClientTable {clients} staffMembers={reading.staffMembers} />
	{/if}
</div>
