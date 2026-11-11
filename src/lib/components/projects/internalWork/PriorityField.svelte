<script lang="ts">
	import { enhance } from '$app/forms';
	import { saveInPlace, submitOwnForm } from '$lib/client/fieldForms';
	import { inPlaceFieldClasses } from './internalWorkStyles';

	let { taskId, priority }: { taskId: string; priority: number } = $props();
</script>

<form method="POST" action="?/setTaskPriority" use:enhance={saveInPlace}>
	<input type="hidden" name="taskId" value={taskId} />
	<input
		type="number"
		name="priority"
		min="1"
		step="1"
		required
		value={priority}
		onchange={submitOwnForm}
		aria-label="Priority, 1 first"
		class={[inPlaceFieldClasses, 'w-16']}
	/>
</form>
