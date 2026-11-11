<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import DueDateField from './DueDateField.svelte';
	import InternalItemTitle from './InternalItemTitle.svelte';
	import OwnerPicker from './OwnerPicker.svelte';
	import PriorityField from './PriorityField.svelte';
	import StatusSelect from './StatusSelect.svelte';
	import { isTaskDone } from '$lib/data/taskStatus';
	import { taskStatusChoices } from './internalWorkStyles';
	import type { InternalItem } from './internalWorkGroups';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
	import type { TaskRowActions } from '../taskRowActions';

	let {
		item,
		actions,
		people,
		todoCount,
		isOpen,
		onToggle
	}: {
		item: InternalItem;
		actions: TaskRowActions;
		people: ProjectPerson[];
		todoCount: number;
		isOpen: boolean;
		onToggle: () => void;
	} = $props();

	const task = $derived(item.task);
	const record = $derived({ name: 'taskId', value: task.id });
	const ownerIds = $derived(actions.assigneesFor(task.id).map((owner) => owner.id));
	const goalTitle = $derived(actions.goalTitleFor(task.goalId));
</script>

<RecordsCell kind="link">
	<InternalItemTitle {task} depth={item.depth} {todoCount} {isOpen} {onToggle} />
</RecordsCell>
<RecordsCell label="Owner">
	<OwnerPicker taskId={task.id} {ownerIds} {people} />
</RecordsCell>
<RecordsCell kind="status" label="Status">
	<StatusSelect action="?/setStatus" {record} choices={taskStatusChoices} current={task.status} label="Where this item stands" />
</RecordsCell>
<RecordsCell label="Due date">
	<DueDateField action="?/setDueDate" {record} dueDate={task.dueDate} isFinished={isTaskDone(task.status)} label="When this item is due" />
</RecordsCell>
<RecordsCell label="Priority">
	<PriorityField taskId={task.id} priority={task.priority} />
</RecordsCell>
<RecordsCell label="Goal">
	<button type="button" onclick={() => actions.onChangeGoal(task)} class="text-left text-sm hover:text-chalk">
		{goalTitle ?? 'No goal'}
	</button>
</RecordsCell>
