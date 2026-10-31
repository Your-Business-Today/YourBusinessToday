<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import TodoStatusForm from './TodoStatusForm.svelte';
	import { accountNameLookup } from '$lib/data/accountNames';
	import { panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
	import type { Todo } from '$lib/server/todos/todoRecord';

	let { todos, people }: { todos: Todo[]; people: ProjectPerson[] } = $props();

	const nameOf = $derived(accountNameLookup(people));
	const anyoneLabel = 'Anyone on the project';

	function ownerName(todo: Todo): string {
		if (todo.ownerAccountId === null) return anyoneLabel;
		return nameOf(todo.ownerAccountId);
	}
</script>

{#if todos.length > 0}
	<DashboardPanel title="To-dos born out of this task" count={todos.length}>
		<p class="px-4 pt-3 text-xs text-chalk/50">
			Jobs for people that never hold this task up. Each sits on its owner's own list.
		</p>
		<ul class={panelListClasses}>
			{#each todos as todo (todo.id)}
				<li class="flex flex-wrap items-center gap-3 px-4 py-2.5">
					<span class="min-w-0 flex-1 text-sm text-chalk/90">{todo.title}</span>
					<span class="text-xs text-chalk/50">{ownerName(todo)}</span>
					<TodoStatusForm todoId={todo.id} status={todo.status} />
				</li>
			{/each}
		</ul>
	</DashboardPanel>
{/if}
