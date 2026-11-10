<script lang="ts">
	import type { ResultPeriod } from '$lib/data/taxCalculator/resultPeriods';
	import type { TakeHomeEstimate } from '$lib/data/taxCalculator/takeHomeEstimate';
	import EmptyTakeHome from './EmptyTakeHome.svelte';
	import TakeHomeActions from './TakeHomeActions.svelte';
	import TakeHomeCard from './TakeHomeCard.svelte';
	import TakeHomePanel from './TakeHomePanel.svelte';

	let {
		estimate,
		period = $bindable(),
		element = $bindable(),
		onSave,
		onExport
	}: {
		estimate: TakeHomeEstimate | null;
		period: ResultPeriod;
		element?: HTMLElement;
		onSave: () => void;
		onExport: () => void;
	} = $props();
</script>

<TakeHomePanel bind:element>
	{#if estimate}
		<TakeHomeCard {estimate} bind:period>
			{#snippet actions()}<TakeHomeActions {onSave} {onExport} />{/snippet}
		</TakeHomeCard>
	{:else}
		<EmptyTakeHome />
	{/if}
</TakeHomePanel>
