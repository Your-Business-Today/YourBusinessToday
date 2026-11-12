<script lang="ts">
	import { enhance } from '$app/forms';
	import PriorityControls from '../PriorityControls.svelte';
	import { saveInPlace, submitOwnForm } from '$lib/client/fieldForms';
	import { shownIdsField } from '$lib/data/shownIds';
	import { placeNumberClasses } from './internalWorkStyles';
	import type { ItemPlace } from './internalWorkGroups';

	let { taskId, place }: { taskId: string; place: ItemPlace } = $props();

	const shownFields = $derived({ [shownIdsField]: place.shownIds });
</script>

<div class="flex items-center gap-0.5">
	<PriorityControls
		moveAction="?/moveTask"
		fieldName="taskId"
		id={taskId}
		isFirst={place.position === 1}
		isLast={place.position === place.count}
		extraFields={shownFields}
	/>
	<form method="POST" action="?/setTaskPriority" use:enhance={saveInPlace}>
		<input type="hidden" name="taskId" value={taskId} />
		<input type="hidden" name={shownIdsField} value={place.shownIds} />
		<input
			type="number"
			name="priority"
			min="1"
			max={place.count}
			step="1"
			required
			value={place.position}
			onchange={submitOwnForm}
			aria-label={`Place in this list, 1 of ${place.count} first`}
			title="Type a number to move it there"
			class={placeNumberClasses}
		/>
	</form>
</div>
