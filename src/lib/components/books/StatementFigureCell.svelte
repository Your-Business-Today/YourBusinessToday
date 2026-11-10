<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import { shownAmount, toneOf } from './shownFigure';

	let { amount, href = null, isTotal = false }: { amount: number | null; href?: string | null; isTotal?: boolean } = $props();
</script>

<RecordsCell kind="figure" tone={toneOf(amount)} href={amount === null || href === null ? undefined : href}>
	<span class={isTotal ? 'font-semibold' : ''}>{shownAmount(amount)}</span>
</RecordsCell>
