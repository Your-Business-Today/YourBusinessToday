<script lang="ts">
	import ConversationParticipantsPanel from '$lib/components/conversations/ConversationParticipantsPanel.svelte';
	import ConversationThread from '$lib/components/conversations/ConversationThread.svelte';
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import EditGoalForm from '$lib/components/goals/EditGoalForm.svelte';
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import GoalDetailHeader from '$lib/components/goals/GoalDetailHeader.svelte';
	import GoalMeasurePanel from '$lib/components/goals/GoalMeasurePanel.svelte';
	import GoalTaskList from '$lib/components/goals/GoalTaskList.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import { dashboardGridClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data, form } = $props();

	let isEditModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
</script>

<svelte:head>
	<title>{data.goal.title} — {data.project.name} — Your Business Today</title>
</svelte:head>

<GoalDetailHeader
	goal={data.goal}
	project={data.project}
	tasks={data.tasks}
	onEdit={() => (isEditModalOpen = true)}
	onDelete={() => (isDeleteModalOpen = true)}
/>

<div class={workspaceBodyClasses}>
	<FlashMessage message={form?.message} />
	<div class={dashboardGridClasses}>
		<div class="flex min-w-0 flex-col gap-4">
			<GoalMeasurePanel goal={data.goal} />
			<GoalTaskList tasks={data.tasks} />
			<ConversationThread
				messages={data.messages}
				people={data.people}
				viewerId={data.viewerId}
				suggestedHandOff={data.suggestedHandOff}
			/>
		</div>
		<aside class="flex min-w-0 flex-col gap-4">
			<ConversationParticipantsPanel people={data.people} participantIds={data.participantIds} />
		</aside>
	</div>
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
