<script lang="ts">
	import AcceptanceCriteriaSection from '$lib/components/projects/AcceptanceCriteriaSection.svelte';
	import BuildPanel from '$lib/components/projects/BuildPanel.svelte';
	import ChecklistSection from '$lib/components/projects/ChecklistSection.svelte';
	import ConversationParticipantsPanel from '$lib/components/conversations/ConversationParticipantsPanel.svelte';
	import ConversationThread from '$lib/components/conversations/ConversationThread.svelte';
	import ResolveSupportTaskForm from '$lib/components/support/ResolveSupportTaskForm.svelte';
	import SubtaskList from '$lib/components/projects/SubtaskList.svelte';
	import TaskAttachmentsSection from '$lib/components/projects/TaskAttachmentsSection.svelte';
	import TaskDetailHeader from '$lib/components/projects/TaskDetailHeader.svelte';
	import TaskOverviewPanel from '$lib/components/projects/TaskOverviewPanel.svelte';
	import TaskPageModals from '$lib/components/projects/TaskPageModals.svelte';

	let { data, form } = $props();

	let isEditModalOpen = $state(false);
	let isSubtaskModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);

	const goalTitle = $derived(
		data.goals.find((goal) => goal.id === data.task.goalId)?.title ?? null
	);
	const isAwaitingResolution = $derived(
		data.task.kind === 'support' && data.task.status !== 'done'
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

<div class="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
	<TaskDetailHeader project={data.project} parentTask={data.parentTask} taskTitle={data.task.title} />
	{#if form?.message}
		<p class="rounded-2xl border border-go/50 bg-go/10 px-5 py-4 text-go">{form.message}</p>
	{/if}
	<TaskOverviewPanel
		task={data.task}
		{goalTitle}
		{assigneeNames}
		raisedByName={data.raisedByName}
		onEdit={() => (isEditModalOpen = true)}
	/>
	{#if isAwaitingResolution}
		<ResolveSupportTaskForm />
	{/if}
	<AcceptanceCriteriaSection criteria={data.criteria} />
	{#if data.canSendToBuild && data.project.repositoryUrl !== ''}
		<BuildPanel task={data.task} project={data.project} />
	{/if}
	<SubtaskList subtasks={data.subtasks} onAddSubtask={() => (isSubtaskModalOpen = true)} />
	<ChecklistSection checklists={data.checklists} />
	<TaskAttachmentsSection
		attachments={data.attachments}
		projectId={data.project.id}
		taskId={data.task.id}
	/>
	<ConversationParticipantsPanel people={data.people} participantIds={data.participantIds} />
	<ConversationThread
		messages={data.messages}
		people={data.people}
		viewerId={data.viewerId}
		suggestedHandOff={data.suggestedHandOff}
	/>
	<button
		type="button"
		onclick={() => (isDeleteModalOpen = true)}
		class="self-end rounded-full border border-hairline px-5 py-2 font-display text-sm
			text-chalk/60 transition hover:border-signal hover:text-signal"
	>
		Delete task…
	</button>
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
