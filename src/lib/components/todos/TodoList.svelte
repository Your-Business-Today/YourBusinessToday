<script lang="ts">
	import TodoRow from './TodoRow.svelte';
	import type { Todo } from '$lib/server/todos/todoRecord';

	let {
		todos,
		emptyNote,
		canTake = false
	}: { todos: Todo[]; emptyNote: string; canTake?: boolean } = $props();
</script>

{#if todos.length === 0}
	<p class="px-4 py-3 text-sm text-chalk/50">{emptyNote}</p>
{:else}
	<ul class="flex flex-col divide-y divide-hairline">
		{#each todos as todo (todo.id)}
			<TodoRow {todo} {canTake} />
		{/each}
	</ul>
{/if}
