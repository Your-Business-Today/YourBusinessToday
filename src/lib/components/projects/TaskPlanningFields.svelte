<script lang="ts">
	import { fibonacciStoryPoints } from '$lib/data/storyPoints';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let { task }: { task: ProjectTask } = $props();

	const fieldClasses =
		'rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none focus:border-go';
</script>

<div class="grid gap-4 sm:grid-cols-2">
	<SmallCapsField label="Story points">
		<select name="storyPoints" value={String(task.storyPoints)} class={fieldClasses}>
			{#each fibonacciStoryPoints as storyPointsOption (storyPointsOption)}
				<option value={String(storyPointsOption)}>{storyPointsOption}</option>
			{/each}
		</select>
	</SmallCapsField>
	<SmallCapsField label="Complete %">
		<input
			name="completionPercent"
			type="number"
			min="0"
			max="100"
			step="5"
			value={task.completionPercent}
			class={fieldClasses}
		/>
	</SmallCapsField>
</div>
