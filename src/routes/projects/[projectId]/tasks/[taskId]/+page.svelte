<script lang="ts">
	import AcceptanceCriteriaSection from '$lib/components/projects/AcceptanceCriteriaSection.svelte';
	import ChecklistSection from '$lib/components/projects/ChecklistSection.svelte';
	import ConversationParticipantsPanel from '$lib/components/conversations/ConversationParticipantsPanel.svelte';
	import ConversationThread from '$lib/components/conversations/ConversationThread.svelte';
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import ResolveSupportTaskForm from '$lib/components/support/ResolveSupportTaskForm.svelte';
	import SubtaskList from '$lib/components/projects/SubtaskList.svelte';
	import TaskAttachmentsSection from '$lib/components/projects/TaskAttachmentsSection.svelte';
	import TaskBranchPanel from '$lib/components/projects/TaskBranchPanel.svelte';
	import TaskDetailHeader from '$lib/components/projects/TaskDetailHeader.svelte';
	import TaskFactsPanel from '$lib/components/projects/TaskFactsPanel.svelte';
	import TaskPageModals from '$lib/components/projects/TaskPageModals.svelte';
	import TaskSequencePanel from '$lib/components/sequences/TaskSequencePanel.svelte';
	import TaskStoryPanel from '$lib/components/projects/TaskStoryPanel.svelte';
	import TaskWaitingNote from '$lib/components/sequences/TaskWaitingNote.svelte';
	import { namesOfPeople } from '$lib/components/projects/namesOfPeople';
	import { openSiblingsOf } from '$lib/components/projects/openSiblings';
	import { dashboardGridClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { isTaskDone } from '$lib/data/taskStatus';
	import { supportTaskKind } from '$lib/data/taskKind';

	let { data, form } = $props();

	let isEditModalOpen = $state(false);
	let isSubtaskModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);

	const { task, project } = $derived(data);
	const goalTitle = $derived(
		data.goals.find((goal) => goal.id === task.goalId)?.title ?? null
	);
	const isAwaitingResolution = $derived(
		task.kind === supportTaskKind && !isTaskDone(task.status)
	);
	const assigneeNames = $derived(namesOfPeople(data.people, data.assigneeIds));
	const waitedForAssigneeNames = $derived(namesOfPeople(data.people, data.waitedForAssigneeIds));
</script>

<svelte:head>
	<title>{task.title} — {project.name} — Your Business Today</title>
</svelte:head>

<TaskDetailHeader
	{project}
	parentTask={data.parentTask}
	{task}
	onEdit={() => (isEditModalOpen = true)}
	onAddSubtask={() => (isSubtaskModalOpen = true)}
	onDelete={() => (isDeleteModalOpen = true)}
/>

<div class={workspaceBodyClasses}>
	<FlashMessage message={form?.message} />
	<div class={dashboardGridClasses}>
		<div class="flex min-w-0 flex-col gap-4">
			<TaskWaitingNote {task} sequence={data.sequence} {waitedForAssigneeNames} />
			<TaskStoryPanel {task} raisedByName={data.raisedByName} />
			{#if isAwaitingResolution}
				<ResolveSupportTaskForm />
			{/if}
			<AcceptanceCriteriaSection criteria={data.criteria} />
			<SubtaskList subtasks={data.subtasks} onAddSubtask={() => (isSubtaskModalOpen = true)} />
			<TaskSequencePanel sequence={data.sequence} />
			<ChecklistSection checklists={data.checklists} />
			<TaskAttachmentsSection
				attachments={data.attachments}
				projectId={project.id}
				taskId={task.id}
			/>
			<ConversationThread
				messages={data.messages}
				people={data.people}
				viewerId={data.viewerId}
			/>
		</div>
		<aside class="flex min-w-0 flex-col gap-4">
			<TaskFactsPanel {task} {goalTitle} {assigneeNames} />
			<TaskBranchPanel {task} {project} />
			<ConversationParticipantsPanel people={data.people} participantIds={data.participantIds} />
		</aside>
	</div>
</div>

<TaskPageModals
	{task}
	parentTask={data.parentTask}
	siblingTasks={data.siblingTasks}
	people={data.people}
	goals={data.goals}
	assigneeIds={data.assigneeIds}
	roles={data.roles}
	otherProjects={data.otherProjects}
	sequenceChoices={data.sequenceChoices}
	subtaskSequenceChoices={openSiblingsOf(data.subtasks)}
	bind:isEditModalOpen
	bind:isSubtaskModalOpen
	bind:isDeleteModalOpen
/>
