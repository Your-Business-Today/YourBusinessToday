<script lang="ts">
	import { blueprintViewHref, blueprintViews, type BlueprintViewKey } from './blueprintViews';

	let { projectId, viewKey }: { projectId: string; viewKey: BlueprintViewKey } = $props();

	function viewClasses(key: BlueprintViewKey): string {
		const look = key === viewKey ? 'bg-go text-night' : 'text-chalk/70 hover:text-go';
		return `rounded-md px-3 py-1 font-display text-sm transition ${look}`;
	}
</script>

<nav aria-label="Views of the product" class="flex rounded-lg border border-hairline p-0.5">
	{#each blueprintViews as view (view.key)}
		{@const isCurrent = view.key === viewKey}
		<a href={blueprintViewHref(projectId, view.path)} aria-current={isCurrent ? 'page' : undefined} class={viewClasses(view.key)}>
			{view.label}
		</a>
	{/each}
</nav>
