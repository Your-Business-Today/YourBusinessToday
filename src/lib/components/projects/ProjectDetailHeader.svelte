<script lang="ts">
	import EditProjectForm from './EditProjectForm.svelte';
	import KitVersionBadge from './KitVersionBadge.svelte';
	import HeaderFacts from '$lib/components/workspace/HeaderFacts.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import ProjectStatusBadge from './ProjectStatusBadge.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { headerButtonClasses, headerPrimaryButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import { projectsCrumb } from '$lib/components/workspace/projectCrumbs';
	import OrganisationBadge from '$lib/components/organisations/OrganisationBadge.svelte';
	import { organisationNameLookup } from '$lib/data/organisationFamilies';
	import { blueprintViewHref, blueprintViews } from '$lib/components/blueprint/blueprintViews';
	import { mainRunFacts } from '$lib/data/mainRunFacts';
	import { stagingBranch } from '$lib/data/stagingBranch';
	import { webAddressLabel } from '$lib/data/webAddressLabel';
	import type { MainRun } from '$lib/data/mainRun';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';
	import type { Project } from '$lib/server/projects/projectRecord';

	let {
		project,
		organisations,
		cadenceLine,
		mainRuns,
		stagingRuns,
		latestKitVersion,
		onAddTask
	}: {
		project: Project;
		organisations: Organisation[];
		cadenceLine: string;
		mainRuns: MainRun[];
		stagingRuns: MainRun[];
		latestKitVersion: string;
		onAddTask: () => void;
	} = $props();

	const organisationName = $derived(organisationNameLookup(organisations)(project.organisationId));

	let isEditModalOpen = $state(false);

	const hasRepository = $derived(project.repositoryUrl !== '');

	const facts = $derived(
		[
			linkFact(project.repositoryUrl),
			linkFact(project.environmentUrl),
			hasRepository ? { label: `⎇ ${project.defaultBranch}` } : null,
			hasRepository ? { label: cadenceLine } : null,
			...(hasRepository ? mainRunFacts(mainRuns) : []),
			...(hasRepository ? mainRunFacts(stagingRuns, stagingBranch) : [])
		].filter((fact) => fact !== null)
	);

	function linkFact(webAddress: string) {
		if (webAddress === '') return null;
		return { label: webAddressLabel(webAddress), href: webAddress };
	}
</script>

<WorkspaceHeader crumbs={[projectsCrumb]} title={project.name}>
	{#snippet badge()}
		<ProjectStatusBadge status={project.status} />
		<OrganisationBadge organisationId={project.organisationId} {organisationName} isTeamProject={project.isTeamProject} />
		<a href="/projects/kit-versions" class="rounded-full">
			<KitVersionBadge
				repositoryUrl={project.repositoryUrl}
				kitVersion={project.kitVersion}
				kitVersionReadAt={project.kitVersionReadAt}
				{latestKitVersion}
			/>
		</a>
	{/snippet}
	{#snippet actions()}
		{#if hasRepository}
			{#each blueprintViews as view (view.key)}
				<a href={blueprintViewHref(project.id, view.path)} class={headerButtonClasses}>{view.label}</a>
			{/each}
		{/if}
		<button type="button" onclick={() => (isEditModalOpen = true)} class={headerButtonClasses}>
			Edit
		</button>
		<button type="button" onclick={onAddTask} class={headerPrimaryButtonClasses}>Add task</button>
	{/snippet}
	{#if project.description !== ''}
		<p class="line-clamp-2 max-w-4xl text-sm text-chalk/70">{project.description}</p>
	{/if}
	<HeaderFacts {facts} />
</WorkspaceHeader>

<Modal title={`Edit ${project.name}`} bind:isOpen={isEditModalOpen}>
	<EditProjectForm {project} {organisations} onSaved={() => (isEditModalOpen = false)} />
</Modal>
