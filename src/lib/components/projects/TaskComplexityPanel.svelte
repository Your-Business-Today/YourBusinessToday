<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import TaskComplexityCount from './TaskComplexityCount.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { complexityFormula, storyPointsForComplexity } from '$lib/data/taskComplexity';
	import { confirmButtonClasses } from '$lib/components/site/formStyles';
	import { enhance } from '$app/forms';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { task }: { task: ProjectTask } = $props();

	const tracker = new FormTracker();
	const measured = $derived(task.complexity);
	const formulaNote = $derived(
		measured === null
			? 'Not measured yet.'
			: `The measures give ${storyPointsForComplexity(measured)} points; the task has ${task.storyPoints}.`
	);
</script>

<DashboardPanel title="Complexity">
	<form
		method="POST"
		action="?/setComplexity"
		use:enhance={tracker.submit(undefined, { shouldKeepFields: true })}
		class="flex flex-col gap-3 px-4 py-3 text-sm"
	>
		<div class="grid grid-cols-2 gap-3">
			<TaskComplexityCount name="viewsChanged" label="Views changed" value={measured?.viewsChanged} />
			<TaskComplexityCount name="newViews" label="New views" value={measured?.newViews} />
			<TaskComplexityCount name="domainObjects" label="Domain objects" value={measured?.domainObjects} />
			<label class="flex items-center gap-2 self-end pb-2 text-chalk/70">
				<input type="checkbox" name="changesDataStructure" checked={measured?.changesDataStructure ?? false} />
				Data structure changes
			</label>
		</div>
		<p class="text-xs text-chalk/50">{formulaNote} {complexityFormula}.</p>
		<FormErrorNote message={tracker.errorMessage} />
		<SubmitButton isSaving={tracker.isSaving} savingLabel="Saving…" class={`self-start ${confirmButtonClasses}`}>
			Set points from measures
		</SubmitButton>
	</form>
</DashboardPanel>
