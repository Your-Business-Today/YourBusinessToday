<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { todoStatuses } from '$lib/data/todo';
	import { todoTaskPath } from '$lib/data/todoLinks';
	import { quietButtonClasses } from '$lib/components/site/formStyles';
	import TodoStatusForm from './TodoStatusForm.svelte';
	import type { Todo } from '$lib/server/todos/todoRecord';

	let { todo, canTake = false }: { todo: Todo; canTake?: boolean } = $props();

	const isDone = $derived(todo.status === todoStatuses.done);
</script>

<li class="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
	<div class="flex min-w-0 flex-1 flex-col gap-0.5">
		<span class={`font-display ${isDone ? 'text-chalk/40 line-through' : 'text-chalk/90'}`}>
			{todo.title}
		</span>
		<span class="text-xs text-chalk/50">
			{#if todo.dueDate !== null}Due {formatBritishDate(todo.dueDate)}{/if}
			{#if todo.taskId !== null && todo.projectId !== null}
				· for <a href={todoTaskPath(todo.projectId, todo.taskId)} class="underline">{todo.taskTitle}</a>
				{#if todo.projectName !== null}on {todo.projectName}{/if}
			{/if}
		</span>
	</div>
	{#if canTake}
		<form method="POST" action="?/updateTodo" use:enhance>
			<input type="hidden" name="todoId" value={todo.id} />
			<input type="hidden" name="takeIt" value="yes" />
			<button type="submit" class={quietButtonClasses}>Take it</button>
		</form>
	{:else}
		<TodoStatusForm todoId={todo.id} status={todo.status} />
	{/if}
</li>
