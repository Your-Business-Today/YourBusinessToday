<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import { todoLimits } from '$lib/data/todo';
	import { inPlaceFieldClasses } from './internalWorkStyles';

	let { taskId }: { taskId: string } = $props();
</script>

<form method="POST" action="?/addTodo" use:enhance class="flex items-center gap-2 pl-6">
	<input type="hidden" name="taskId" value={taskId} />
	<input
		type="text"
		name="title"
		required
		maxlength={todoLimits.longestTitle}
		placeholder="+ Add a to-do"
		aria-label="A new to-do under this item"
		class={[inPlaceFieldClasses, 'min-w-0 flex-1']}
	/>
	<Button type="submit" look="ghost">Add</Button>
</form>
