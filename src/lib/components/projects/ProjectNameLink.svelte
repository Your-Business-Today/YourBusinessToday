<script lang="ts">
	import InternalProjectBadge from './InternalProjectBadge.svelte';
	import { projectNameClasses } from './projectTableStyles';

	let { project }: { project: { id: string; name: string; isInternal: boolean } } = $props();
</script>

<span class="flex min-w-0 items-center gap-2">
	<a href={`/projects/${project.id}`} class={projectNameClasses}>{project.name}</a>
	{#if project.isInternal}
		<InternalProjectBadge />
	{/if}
</span>
