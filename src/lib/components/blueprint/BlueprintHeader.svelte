<script lang="ts">
	import HeaderFacts from '$lib/components/workspace/HeaderFacts.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import BlueprintViewSwitch from './BlueprintViewSwitch.svelte';
	import { shortCommit, type BlueprintViewKey } from './blueprintViews';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { enhance } from '$app/forms';
	import { formatBritishDateTime } from '$lib/data/britishDate';
	import { headerButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import { projectCrumbs } from '$lib/components/workspace/projectCrumbs';
	import type { Project } from '$lib/server/projects/projectRecord';
	import type { ProjectBlueprint } from '$lib/data/blueprint/projectBlueprint';

	let {
		project,
		blueprint,
		viewKey,
		title
	}: { project: Project; blueprint: ProjectBlueprint | null; viewKey: BlueprintViewKey; title: string } = $props();

	const tracker = new FormTracker();

	const facts = $derived(
		blueprint === null
			? []
			: [{ label: `Read at ${shortCommit(blueprint.readAtCommit)}` }, { label: formatBritishDateTime(blueprint.readAt) }]
	);
</script>

<WorkspaceHeader crumbs={projectCrumbs(project)} {title}>
	{#snippet actions()}
		<BlueprintViewSwitch projectId={project.id} {viewKey} />
		<form
			method="POST"
			action="?/readBlueprint"
			use:enhance={tracker.submit()}
		>
			<SubmitButton isSaving={tracker.isSaving} savingLabel="Reading…" class={headerButtonClasses}>
				Read from GitHub
			</SubmitButton>
		</form>
	{/snippet}
	<HeaderFacts {facts} />
</WorkspaceHeader>
