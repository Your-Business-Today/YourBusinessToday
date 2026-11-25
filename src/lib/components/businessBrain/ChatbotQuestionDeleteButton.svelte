<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';

	let { questionId }: { questionId: string } = $props();

	let isConfirmOpen = $state(false);

	function askToDelete() {
		isConfirmOpen = true;
	}
</script>

<div class="flex justify-end">
	<Button look="ghost" isDestructive onclick={askToDelete}>Delete from the record</Button>
</div>
<DangerConfirmModal
	title="Delete this question"
	description="This deletes the question from the chatbot's record, with what was read for it and the answer reported. It cannot be undone. The deletion is itself recorded: who deleted it and when, but not its words."
	action="?/deleteQuestion"
	fields={{ questionId }}
	submitLabel="Delete question"
	bind:isOpen={isConfirmOpen}
/>
