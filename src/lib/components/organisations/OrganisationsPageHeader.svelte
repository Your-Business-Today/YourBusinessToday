<script lang="ts">
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { headerPrimaryButtonClasses } from '$lib/components/workspace/workspaceStyles';

	let { canCreate, onNewOrganisation }: { canCreate: boolean; onNewOrganisation: () => void } = $props();
</script>

<WorkspaceHeader crumbs={[]} title="Organisations">
	{#snippet actions()}
		{#if canCreate}
			<button type="button" onclick={onNewOrganisation} class={headerPrimaryButtonClasses}>
				New organisation
			</button>
		{/if}
	{/snippet}
	<p class="text-sm text-chalk/60">
		Who each project is for. Everyone on an organisation is on every project under it; its project
		managers decide who that is.
	</p>
</WorkspaceHeader>
