<script lang="ts">
	import { enhance } from '$app/forms';
	import { todoStatusLabels, todoStatusOrder, type TodoStatus } from '$lib/data/todo';

	let { todoId, status }: { todoId: string; status: TodoStatus } = $props();

	function submitOnChange(event: Event) {
		const select = event.currentTarget as HTMLSelectElement;
		select.form?.requestSubmit();
	}
</script>

<form method="POST" action="?/updateTodo" use:enhance>
	<input type="hidden" name="todoId" value={todoId} />
	<select
		name="status"
		value={status}
		onchange={submitOnChange}
		aria-label="Where this to-do stands"
		class="rounded-full border border-hairline bg-night px-3 py-1 font-display text-xs text-chalk/80"
	>
		{#each todoStatusOrder as option (option)}
			<option value={option}>{todoStatusLabels[option]}</option>
		{/each}
	</select>
</form>
