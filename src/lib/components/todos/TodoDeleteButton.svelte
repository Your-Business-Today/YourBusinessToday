<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Todo } from '$lib/server/todos/todoRecord';

	let { todo }: { todo: Todo } = $props();

	const deleteLabel = $derived(`Delete “${todo.title}”`);
</script>

<form method="POST" action="?/deleteTodo" use:enhance>
	<input type="hidden" name="todoId" value={todo.id} />
	<button type="submit" aria-label={deleteLabel} title={deleteLabel} class="px-1 text-chalk/40 transition hover:text-signal">
		✕
	</button>
</form>
