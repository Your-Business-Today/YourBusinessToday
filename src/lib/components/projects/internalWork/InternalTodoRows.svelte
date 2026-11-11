<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import AddTodoLine from './AddTodoLine.svelte';
	import DueDateField from './DueDateField.svelte';
	import StatusSelect from './StatusSelect.svelte';
	import TodoOwnerSelect from './TodoOwnerSelect.svelte';
	import TodoTickTitle from './TodoTickTitle.svelte';
	import { isTodoOpen } from '$lib/data/todo';
	import { rowClasses } from '$lib/components/workspace/recordsTableStyles';
	import { todoStatusChoices } from './internalWorkStyles';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
	import type { Todo } from '$lib/server/todos/todoRecord';

	let {
		taskId,
		todos,
		people,
		columnCount
	}: { taskId: string; todos: Todo[]; people: ProjectPerson[]; columnCount: number } = $props();

	const subItemRowClasses = `${rowClasses} bg-night/30`;
</script>

{#each todos as todo (todo.id)}
	{@const record = { name: 'todoId', value: todo.id }}
	<tr class={subItemRowClasses}>
		<RecordsCell><TodoTickTitle {todo} /></RecordsCell>
		<RecordsCell label="Owner"><TodoOwnerSelect todoId={todo.id} ownerId={todo.ownerAccountId} {people} /></RecordsCell>
		<RecordsCell kind="status" label="Status">
			<StatusSelect action="?/updateTodo" {record} choices={todoStatusChoices} current={todo.status} label="Where this to-do stands" />
		</RecordsCell>
		<RecordsCell label="Due date">
			<DueDateField action="?/updateTodo" {record} dueDate={todo.dueDate} isFinished={!isTodoOpen(todo.status)} label="When this to-do is due" />
		</RecordsCell>
		<RecordsCell isWideOnly><span class="sr-only">No priority</span></RecordsCell>
		<RecordsCell isWideOnly><span class="sr-only">No goal</span></RecordsCell>
	</tr>
{/each}
<tr class={subItemRowClasses}>
	<td colspan={columnCount} class="px-4 py-2 md:px-6">
		<AddTodoLine {taskId} />
	</td>
</tr>
