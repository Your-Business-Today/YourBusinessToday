<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import PortalClaudePlanRow from './PortalClaudePlanRow.svelte';
	import { claudePlanSteps, desktopNote } from '$lib/portal/connectingClaude';
	import { panelListClasses } from '$lib/components/workspace/workspaceStyles';
</script>

<DashboardPanel title="Connect it on your Claude plan">
	<ul class={panelListClasses}>
		{#each claudePlanSteps as planSteps (planSteps.plans)}
			<PortalClaudePlanRow {planSteps} />
		{/each}
	</ul>
	<p class="border-t border-hairline px-4 py-3 text-sm text-chalk/60">{desktopNote}</p>
</DashboardPanel>
