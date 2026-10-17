<script lang="ts">
	import ConversationParticipantsPanel from '$lib/components/conversations/ConversationParticipantsPanel.svelte';
	import LifecyclePanel from '$lib/components/lifecycle/LifecyclePanel.svelte';
	import TaskBranchPanel from './TaskBranchPanel.svelte';
	import TaskComplexityPanel from './TaskComplexityPanel.svelte';
	import TaskFactsPanel from './TaskFactsPanel.svelte';
	import type { ComponentProps } from 'svelte';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import type { LifecycleStep } from '$lib/server/lifecycle/lifecycleStepRecord';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	type Participants = ComponentProps<typeof ConversationParticipantsPanel>;

	let {
		task,
		project,
		goal,
		assigneeNames,
		people,
		participantIds,
		lifecycleSteps
	}: {
		task: ProjectTask;
		project: ComponentProps<typeof TaskBranchPanel>['project'];
		goal: Goal | null;
		assigneeNames: string[];
		people: Participants['people'];
		participantIds: Participants['participantIds'];
		lifecycleSteps: LifecycleStep[];
	} = $props();
</script>

<aside class="flex min-w-0 flex-col gap-4">
	<TaskFactsPanel {task} {goal} {assigneeNames} />
	<TaskComplexityPanel {task} />
	<TaskBranchPanel {task} {project} />
	<LifecyclePanel steps={lifecycleSteps} repositoryUrl={project.repositoryUrl} />
	<ConversationParticipantsPanel {people} {participantIds} />
</aside>
