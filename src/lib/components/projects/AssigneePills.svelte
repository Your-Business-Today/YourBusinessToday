<script lang="ts">
	import type { TaskAssignee } from './taskRowActions';

	let { assignees }: { assignees: TaskAssignee[] } = $props();

	const viewerPillClasses = 'border-go/50 bg-go/10 text-go';
	const otherPillClasses = 'border-hairline text-chalk/60';
</script>

{#each assignees as assignee (assignee.id)}
	<span
		title={`Assigned to ${assignee.name}`}
		class={`rounded-full border px-2 py-0.5 font-display text-xs whitespace-nowrap ${
			assignee.isViewer ? viewerPillClasses : otherPillClasses
		}`}
	>
		{assignee.isViewer ? 'You' : assignee.name}
	</span>
{/each}
