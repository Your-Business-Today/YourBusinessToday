<script lang="ts">
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import { deletedTaskInputs, whatComesBack } from '$lib/data/deletedTask';
	import type { DeletedTask } from '$lib/server/projects/readDeletedTasks';

	let { deletedTask, isOpen = $bindable() }: { deletedTask: DeletedTask; isOpen: boolean } = $props();

	const title = 'Put task back';
	const fields = $derived({ [deletedTaskInputs.deletionId]: deletedTask.deletionId });
	const description = $derived(whatComesBack(deletedTask.title, deletedTask.attachedFilenames));
	const placement = $derived(
		deletedTask.parentTitle === null ? 'It goes back at the top level of the project.' : placementUnderParent()
	);

	function placementUnderParent(): string {
		return `It goes back under “${deletedTask.parentTitle}” if that task still stands, and at the top level if not.`;
	}
</script>

<DangerConfirmModal {title} {description} action="?/putBack" {fields} submitLabel={title} savingLabel="Putting back…" bind:isOpen>
	<p class="text-sm text-chalk/70">{placement}</p>
</DangerConfirmModal>
