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
	import TaskStoryPanel from '$lib/components/projects/TaskStoryPanel.svelte';
	import { dashboardGridClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { isTaskDone } from '$lib/data/taskStatus';
	import { supportTaskKind } from '$lib/data/taskKind';

	let { data, form } = $props();

	let isEditModalOpen = $state(false);
	let isSubtaskModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);

	const goalTitle = $derived(
		data.goals.find((goal) => goal.id === data.task.goalId)?.title ?? null
	);
	const isAwaitingResolution = $derived(
		data.task.kind === supportTaskKind && !isTaskDone(data.task.status)
	);
	const assigneeNames = $derived(
		data.people
			.filter((person) => data.assigneeIds.includes(person.id))
			.map((person) => person.name)
	);
</script>

<svelte:head>
	<title>{data.task.title} — {data.project.name} — Your Business Today</title>
</svelte:head>

<TaskDetailHeader
	project={data.project}
	parentTask={data.parentTask}
	task={data.task}
	onEdit={() => (isEditModalOpen = true)}
	onAddSubtask={() => (isSubtaskModalOpen = true)}
	onDelete={() => (isDeleteModalOpen = true)}
/>

<div class={workspaceBodyClasses}>
	<FlashMessage message={form?.message} />
	<div class={dashboardGridClasses}>
		<div class="flex min-w-0 flex-col gap-4">
			<TaskStoryPanel task={data.task} raisedByName={data.raisedByName} />
			{#if isAwaitingResolution}
				<ResolveSupportTaskForm />
			{/if}
			<AcceptanceCriteriaSection criteria={data.criteria} />
			<SubtaskList subtasks={data.subtasks} onAddSubtask={() => (isSubtaskModalOpen = true)} />
			<ChecklistSection checklists={data.checklists} />
			<TaskAttachmentsSection
				attachments={data.attachments}
				projectId={data.project.id}
				taskId={data.task.id}
			/>
			<ConversationThread
				messages={data.messages}
				people={data.people}
				viewerId={data.viewerId}
				suggestedHandOff={data.suggestedHandOff}
			/>
		</div>
		<aside class="flex min-w-0 flex-col gap-4">
			<TaskFactsPanel task={data.task} {goalTitle} {assigneeNames} />
			<TaskBranchPanel task={data.task} project={data.project} />
			<ConversationParticipantsPanel people={data.people} participantIds={data.participantIds} />
		</aside>
	</div>
</div>

<TaskPageModals
	task={data.task}
	parentTask={data.parentTask}
	siblingTasks={data.siblingTasks}
	people={data.people}
	goals={data.goals}
	assigneeIds={data.assigneeIds}
	roles={data.roles}
	otherProjects={data.otherProjects}
	bind:isEditModalOpen
	bind:isSubtaskModalOpen
	bind:isDeleteModalOpen
/>
