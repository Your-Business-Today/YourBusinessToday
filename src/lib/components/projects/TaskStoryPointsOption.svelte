<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';

	let {
		taskId,
		storyPoints,
		isCurrent,
		isSaving,
		submit
	}: {
		taskId: string;
		storyPoints: number;
		isCurrent: boolean;
		isSaving: boolean;
		submit: SubmitFunction;
	} = $props();

	const optionClasses = $derived(
		isCurrent ? 'border-go bg-go/10 text-go' : 'border-hairline text-chalk/80 hover:border-go hover:text-go'
	);
</script>

<form method="POST" action="?/setStoryPoints" use:enhance={submit}>
	<input type="hidden" name="taskId" value={taskId} />
	<input type="hidden" name="storyPoints" value={storyPoints} />
	<button
		type="submit"
		disabled={isCurrent || isSaving}
		title={isCurrent ? 'Current story points' : `Set to ${storyPoints} points`}
		class={`w-full rounded-xl border py-3 font-display text-base tabular-nums transition
			disabled:cursor-default ${optionClasses}`}
	>
		{storyPoints}
	</button>
</form>
