<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import InternalItemCells from './InternalItemCells.svelte';
	import InternalTodoRows from './InternalTodoRows.svelte';
	import InternalWorkGroupHeader from './InternalWorkGroupHeader.svelte';
	import type { InternalItem, InternalWorkGroup } from './internalWorkGroups';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
	import type { TaskRowActions } from '../taskRowActions';
	import type { Todo } from '$lib/server/todos/todoRecord';

	let {
		group,
		actions,
		people,
		todosByTask,
		onAddItem
	}: {
		group: InternalWorkGroup;
		actions: TaskRowActions;
		people: ProjectPerson[];
		todosByTask: Record<string, Todo[]>;
		onAddItem: () => void;
	} = $props();

	const columns = [
		{ key: 'item', label: 'Item' },
		{ key: 'owner', label: 'Owner' },
		{ key: 'status', label: 'Status' },
		{ key: 'dueDate', label: 'Due date' },
		{ key: 'priority', label: 'Priority' },
		{ key: 'goal', label: 'Goal' }
	];

	let isFolded = $state(false);
	const openItemIds = new SvelteSet<string>();
	const todosOf = (item: InternalItem) => todosByTask[item.id] ?? [];

	function toggleTodos(itemId: string) {
		if (openItemIds.has(itemId)) {
			openItemIds.delete(itemId);
			return;
		}
		openItemIds.add(itemId);
	}
</script>

<section class="flex flex-col gap-2 border-b border-hairline px-4 py-4 md:px-6">
	<InternalWorkGroupHeader {group} {isFolded} onToggle={() => (isFolded = !isFolded)} {onAddItem} />
	{#if !isFolded}
		<RecordsTable label={`${group.label} items`} {columns} rows={group.items} keyOf={(item) => item.id} isCardsOnPhone emptyMessage="No items here yet.">
			{#snippet cells(item)}
				{@const todos = todosOf(item)}
				<InternalItemCells {item} {actions} {people} todoCount={todos.length} isOpen={openItemIds.has(item.id)} onToggle={() => toggleTodos(item.id)} />
			{/snippet}
			{#snippet subRows(item)}
				{#if openItemIds.has(item.id)}
					<InternalTodoRows taskId={item.id} todos={todosOf(item)} {people} columnCount={columns.length} />
				{/if}
			{/snippet}
		</RecordsTable>
	{/if}
</section>
