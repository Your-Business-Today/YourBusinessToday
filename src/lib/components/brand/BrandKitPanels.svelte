<script lang="ts">
	import BrandChannelTable from './BrandChannelTable.svelte';
	import BrandKitList from './BrandKitList.svelte';
	import BrandSwatches from './BrandSwatches.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { dashboardGridClasses } from '$lib/components/workspace/workspaceStyles';
	import { nothingDecidedYet, starterKindsOffered } from './brandKitPageWords';
	import type { BrandKitPage } from '$lib/brand/projections/brandKitPage';
	import type { Snippet } from 'svelte';

	let { kit, beforeKit, afterKit }: { kit: BrandKitPage; beforeKit?: Snippet; afterKit?: Snippet } = $props();
</script>

<div class={dashboardGridClasses}>
	<div class="flex min-w-0 flex-col gap-6">
		{@render beforeKit?.()}
		<DashboardPanel title="Palette" isPadded>
			<BrandSwatches entries={kit.palette} emptyMessage={nothingDecidedYet} />
		</DashboardPanel>
		<DashboardPanel title="Type" isPadded>
			<BrandKitList entries={kit.type} emptyMessage={nothingDecidedYet} />
		</DashboardPanel>
		<DashboardPanel title="Spacing, corners and motion" isPadded>
			<BrandKitList entries={kit.spacingAndShape} emptyMessage={nothingDecidedYet} />
		</DashboardPanel>
		<DashboardPanel title="Set for one channel">
			<BrandChannelTable entries={kit.forOneChannel} />
		</DashboardPanel>
		{@render afterKit?.()}
	</div>
	<aside class="flex min-w-0 flex-col gap-6">
		<DashboardPanel title="Tone of voice" isPadded>
			<BrandKitList entries={kit.voice} emptyMessage={nothingDecidedYet} />
		</DashboardPanel>
		<DashboardPanel title="Kinds of post" isPadded>
			<BrandKitList entries={kit.postKinds} emptyMessage={starterKindsOffered} />
		</DashboardPanel>
		<DashboardPanel title="Never say" isPadded>
			<BrandKitList entries={kit.neverSay} emptyMessage={nothingDecidedYet} />
		</DashboardPanel>
		<DashboardPanel title="Audience" isPadded>
			<BrandKitList entries={kit.audience} emptyMessage={nothingDecidedYet} />
		</DashboardPanel>
	</aside>
</div>
