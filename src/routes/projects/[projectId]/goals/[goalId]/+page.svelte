<script lang="ts">
	import ConversationParticipantsPanel from '$lib/components/conversations/ConversationParticipantsPanel.svelte';
	import ConversationThread from '$lib/components/conversations/ConversationThread.svelte';
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import EditGoalForm from '$lib/components/goals/EditGoalForm.svelte';
	import GoalOverviewPanel from '$lib/components/goals/GoalOverviewPanel.svelte';
	import GoalTaskList from '$lib/components/goals/GoalTaskList.svelte';
	import Modal from '$lib/components/site/Modal.svelte';

	let { data, form } = $props();

	let isEditModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
</script>

<svelte:head>
	<title>{data.goal.title} — {data.project.name} — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-col gap-2">
		<a
			href={`/projects/${data.project.id}`}
			class="font-display text-sm text-chalk/50 transition hover:text-chalk"
		>
			← {data.project.name}
		</a>
		<h1 class="font-display text-3xl font-medium">{data.goal.title}</h1>
	</div>
	{#if form?.message}
		<p class="rounded-2xl border border-go/50 bg-go/10 px-5 py-4 text-go">{form.message}</p>
	{/if}
	<GoalOverviewPanel goal={data.goal} onEdit={() => (isEditModalOpen = true)} />
	<GoalTaskList tasks={data.tasks} />
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
		Delete goal…
	</button>
</div>

<Modal title="Edit goal" bind:isOpen={isEditModalOpen}>
	<EditGoalForm goal={data.goal} onSaved={() => (isEditModalOpen = false)} />
</Modal>

<DangerConfirmModal
	title="Delete goal"
	description={`Delete “${data.goal.title}”? Its tasks are kept — they just lose the goal. The conversation on it is deleted with it.`}
	action="?/deleteGoal"
	fields={{}}
	submitLabel="Delete goal"
	bind:isOpen={isDeleteModalOpen}
/>
