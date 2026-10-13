<script lang="ts">
	import type { PortalTask } from '$lib/portal/portalProject';

	let { task }: { task: PortalTask } = $props();

	const hasGoal = $derived(task.goalTitle !== '');
</script>

<li class="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
	<div class="flex min-w-0 flex-col gap-0.5">
		<span class="truncate text-sm text-chalk">{task.title}</span>
		{#if hasGoal}
			<span class="truncate text-xs text-chalk/50">{task.goalTitle}</span>
		{/if}
	</div>
	<span class="shrink-0 font-display text-xs text-chalk/60">{task.statusLabel}</span>
</li>
