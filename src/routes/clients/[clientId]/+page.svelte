<script lang="ts">
	import AssignProjectForm from '$lib/components/clients/AssignProjectForm.svelte';
	import ClientEventLedger from '$lib/components/clients/ClientEventLedger.svelte';
	import ClientGroupSection from '$lib/components/clients/ClientGroupSection.svelte';
	import ClientPeopleSection from '$lib/components/clients/ClientPeopleSection.svelte';
	import ClientProjectList from '$lib/components/clients/ClientProjectList.svelte';
	import CompanyProfileForm from '$lib/components/clients/CompanyProfileForm.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import SupportTaskTable from '$lib/components/support/SupportTaskTable.svelte';
	import { clientStageLabels } from '$lib/data/clientLifecycle';
	import { leadSourceLabels } from '$lib/data/leadSources';
	import { primaryButtonClasses, quietButtonClasses } from '$lib/components/site/formStyles';

	let { data, form } = $props();

	const { client, parent, projects, supportTasks } = $derived(data);

	let isAssignProjectModalOpen = $state(false);

	const researchAgainHref = $derived(
		`/clients/research?clientId=${client.id}&query=${encodeURIComponent(client.website || client.name)}`
	);
</script>

<svelte:head>
	<title>{client.name} — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
	<div class="flex flex-col gap-2">
		<a href="/clients" class="font-display text-sm text-chalk/50 hover:text-chalk">← Clients</a>
		<h1 class="font-display text-3xl font-medium">{client.name}</h1>
		<p class="text-chalk/70">
			{clientStageLabels[client.stage]} · {leadSourceLabels[client.leadSource]}
			{#if parent !== null}
				· Part of <a href={`/clients/${parent.id}`} class="hover:text-signal">{parent.name}</a>
			{/if}
			{#if client.website !== ''}
				· <a href={client.website} class="hover:text-signal">{client.website}</a>
			{/if}
		</p>
	</div>
	<FormErrorNote message={form?.message ?? null} />

	<section class="flex flex-col gap-4">
		<div class="flex items-center justify-between gap-4">
			<h2 class="font-display text-xl">Company profile</h2>
			<a href={researchAgainHref} class={quietButtonClasses}>Research again</a>
		</div>
		<CompanyProfileForm {client} />
	</section>

	<ClientPeopleSection
		people={data.people}
		approachDraft={form?.approachDraft ?? null}
		canImportOfficers={data.canImportOfficers}
	/>

	<ClientGroupSection
		{client}
		{parent}
		children={data.children}
		parents={data.parents}
	/>

	<section class="flex flex-col gap-4">
		<div class="flex items-center justify-between gap-4">
			<h2 class="font-display text-xl">Projects</h2>
			<button class={primaryButtonClasses} onclick={() => (isAssignProjectModalOpen = true)}>
				Add project
			</button>
		</div>
		{#if projects.length === 0}
			<p class="text-sm text-chalk/50">
				No projects yet — set this client on a project from its own page.
			</p>
		{:else}
			<ClientProjectList {projects} />
		{/if}
	</section>

	<section class="flex flex-col gap-4">
		<h2 class="font-display text-xl">Support</h2>
		{#if supportTasks.length === 0}
			<p class="text-sm text-chalk/50">Nothing raised yet.</p>
		{:else}
			<SupportTaskTable tasks={supportTasks} />
		{/if}
	</section>

	<section class="flex flex-col gap-4">
		<h2 class="font-display text-xl">History</h2>
		<ClientEventLedger events={data.events} />
	</section>
</div>

<Modal title="Add project" bind:isOpen={isAssignProjectModalOpen}>
	<AssignProjectForm projects={data.unassignedProjects} />
</Modal>
