<script lang="ts">
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { headerButtonClasses, headerPrimaryButtonClasses } from '$lib/components/workspace/workspaceStyles';

	let { onNewProject }: { onNewProject: () => void } = $props();
</script>

<WorkspaceHeader crumbs={[]} title="Projects">
	{#snippet actions()}
		<a href="/tasks" class={headerButtonClasses}>Task view</a>
		<a href="/projects/kit-versions" class={headerButtonClasses}>Kit versions</a>
		<button type="button" onclick={onNewProject} class={headerPrimaryButtonClasses}>
			New project
		</button>
	{/snippet}
	<p class="text-sm text-chalk/60">
		Your projects, ordered by priority — the first tile is the next thing to spend time on.
	</p>
</WorkspaceHeader>
