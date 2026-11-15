<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import FollowUpRow from './FollowUpRow.svelte';
	import { panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { FollowUp } from '$lib/server/people/getFollowUpsDue';

	let { followUps, today }: { followUps: FollowUp[]; today: string } = $props();
</script>

<DashboardPanel title="Follow-ups due" count={followUps.length}>
	<ul class={panelListClasses}>
		{#each followUps as followUp (followUp.id)}
			<FollowUpRow {followUp} {today} />
		{/each}
	</ul>
</DashboardPanel>
