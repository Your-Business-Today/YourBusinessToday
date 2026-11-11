<script lang="ts">
	import { enhance } from '$app/forms';
	import { isTodoOpen, todoStatuses } from '$lib/data/todo';
	import { saveInPlace } from '$lib/client/fieldForms';
	import type { Todo } from '$lib/server/todos/todoRecord';

	let { todo }: { todo: Todo } = $props();

	const isDone = $derived(!isTodoOpen(todo.status));
	const statusAfterPress = $derived(isDone ? todoStatuses.toDo : todoStatuses.done);
	const tickLabel = $derived(isDone ? `Mark “${todo.title}” not done` : `Tick “${todo.title}” off`);
</script>

<form method="POST" action="?/updateTodo" use:enhance={saveInPlace} class="flex min-w-60 items-center gap-2 pl-6 md:min-w-72">
	<input type="hidden" name="todoId" value={todo.id} />
	<button
		type="submit"
		name="status"
		value={statusAfterPress}
		aria-label={tickLabel}
		title={tickLabel}
		class={[
			'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border text-[0.65rem]',
			isDone ? 'border-go bg-go text-night' : 'border-hairline-strong hover:border-go'
		]}
	>
		{isDone ? '✓' : ''}
	</button>
	<span class={['min-w-0 text-sm', isDone ? 'text-chalk-subtle line-through' : 'text-chalk-muted']}>{todo.title}</span>
</form>
