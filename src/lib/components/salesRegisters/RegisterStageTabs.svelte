<script lang="ts">
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import { clientStageLabels, type ClientStage } from '$lib/data/clientLifecycle';
	import type { SalesRegister } from '$lib/data/salesRegisters';

	let {
		register,
		chosenStage,
		stageCounts,
		totalCount
	}: {
		register: SalesRegister;
		chosenStage: ClientStage | null;
		stageCounts: Record<ClientStage, number>;
		totalCount: number;
	} = $props();

	const everyStageKey = 'all';

	const tabs = $derived([
		{ key: everyStageKey, label: 'All', count: totalCount, href: register.path },
		...register.stages.map((stage) => ({
			key: stage,
			label: clientStageLabels[stage],
			count: stageCounts[stage],
			href: `${register.path}?stage=${stage}`
		}))
	]);
</script>

<TabStrip {tabs} selectedKey={chosenStage ?? everyStageKey} />
