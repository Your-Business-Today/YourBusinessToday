<script lang="ts">
	import { projectTileClasses } from './projectTileStyles';
	import type { Snippet } from 'svelte';

	let {
		projectId,
		projectName,
		content
	}: { projectId: string; projectName: string; content: Snippet } = $props();
</script>

<li class={projectTileClasses}>
	<a href={`/projects/${projectId}`} class="absolute inset-0 rounded-xl">
		<span class="sr-only">Open {projectName}</span>
	</a>
	{@render content()}
</li>
