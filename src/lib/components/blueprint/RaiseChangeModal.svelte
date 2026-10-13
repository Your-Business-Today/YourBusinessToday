<script lang="ts">
	import Modal from '$lib/components/site/Modal.svelte';
	import NewTaskForm from '$lib/components/projects/NewTaskForm.svelte';
	import { changeSubjectFieldsOf, describeChangeSubject, type ChangeSubject } from '$lib/data/blueprint/changeSubject';
	import type { Goal } from '$lib/server/goals/goalRecord';

	let {
		subject,
		goals,
		isOpen = $bindable()
	}: { subject: ChangeSubject; goals: Goal[]; isOpen: boolean } = $props();
</script>

<Modal title="Raise a change" bind:isOpen maxWidthClass="max-w-2xl">
	<p class="mb-4 text-sm text-chalk/60">
		It lands on this project's backlog as a task, raised from {describeChangeSubject(subject)}.
	</p>
	<NewTaskForm
		createAction="?/raiseChange"
		{goals}
		hiddenFields={changeSubjectFieldsOf(subject)}
		submitLabel="Raise change"
		onCreated={() => (isOpen = false)}
	/>
</Modal>
