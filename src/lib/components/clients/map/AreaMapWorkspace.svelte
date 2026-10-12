<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import AreaCompanyList from './AreaCompanyList.svelte';
	import AreaCompanyPanel from './AreaCompanyPanel.svelte';
	import AreaMapPane from './AreaMapPane.svelte';
	import type { AreaPin } from '$lib/server/clients/area/areaPin';

	type MappedArea = ComponentProps<typeof AreaMapPane>['area'];

	let {
		area,
		listedPins,
		addLeadAction,
		addWithDirectorsAction
	}: { area: MappedArea; listedPins: AreaPin[]; addLeadAction: string; addWithDirectorsAction: string } = $props();

	let selectedKey = $state<string | null>(null);

	const selectedPin = $derived(area.pins.find((pin) => pin.key === selectedKey) ?? null);
</script>

<div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
	<AreaMapPane {area} {selectedKey} onSelect={(key) => (selectedKey = key)} />
	<div class="flex flex-col gap-4">
		<AreaCompanyPanel pin={selectedPin} {addLeadAction} {addWithDirectorsAction} />
		<AreaCompanyList pins={listedPins} {selectedKey} onSelect={(key) => (selectedKey = key)} />
	</div>
</div>
