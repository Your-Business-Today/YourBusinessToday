<script lang="ts">
	import StatTile from '$lib/components/workspace/StatTile.svelte';
	import type { ProjectPulse } from '$lib/server/projects/summariseProjectPulse';

	let { pulse }: { pulse: ProjectPulse } = $props();

	const waitingTone = $derived(pulse.waitingOnViewerCount > 0 ? 'attention' : 'plain');
</script>

<div class="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
	<StatTile
		label="Open tasks"
		value={`${pulse.openTaskCount}`}
		caption={`${pulse.inProgressCount} in progress`}
	/>
	<StatTile
		label="Complete"
		value={`${pulse.completionPercent}%`}
		caption={`across ${pulse.currentTaskCount} current tasks`}
		tone="go"
	/>
	<StatTile
		label="Waiting on you"
		value={`${pulse.waitingOnViewerCount}`}
		caption="conversations"
		tone={waitingTone}
	/>
	<StatTile
		label="Assigned to you"
		value={`${pulse.assignedToViewerCount}`}
		caption="open current tasks"
	/>
</div>
