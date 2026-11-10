<script lang="ts">
	import { keyboardKeys } from '$lib/client/keyboardKeys';
	import type { PlacedArea } from '$lib/data/companyContext/contextMapLayout';

	let {
		placed,
		isSelected,
		onSelect
	}: { placed: PlacedArea; isSelected: boolean; onSelect: (partKey: string) => void } = $props();

	const titleInset = { x: 12, y: 22 };
	const coreMark = '★ ';
	const unplacedDashes = '4 3';

	const titleX = $derived(placed.x + titleInset.x);
	const titleY = $derived(placed.y + titleInset.y);
	const titleClasses = 'font-display text-[11px] tracking-widest uppercase';

	function select() {
		onSelect(placed.key);
	}

	function selectOnEnter(event: KeyboardEvent) {
		if (event.key === keyboardKeys.enter) select();
	}
</script>

<g>
	<title>{placed.fullTitle}</title>
	<rect
		x={placed.x}
		y={placed.y}
		width={placed.width}
		height={placed.height}
		rx="12"
		stroke-dasharray={placed.isAnArea ? undefined : unplacedDashes}
		class={['fill-carriage', isSelected ? 'stroke-go' : 'stroke-hairline']}
	/>
	{#if placed.isAnArea}
		<g
			role="button"
			tabindex="0"
			aria-pressed={isSelected}
			aria-label={`${placed.fullTitle}, area of the business`}
			onclick={select}
			onkeydown={selectOnEnter}
			class="cursor-pointer outline-none"
		>
			<text x={titleX} y={titleY} class={[titleClasses, isSelected ? 'fill-go' : 'fill-chalk/70 hover:fill-go']}>
				{placed.isCore ? coreMark : ''}{placed.title}
			</text>
		</g>
	{:else}
		<text x={titleX} y={titleY} class={[titleClasses, 'fill-chalk/50']}>{placed.title}</text>
	{/if}
</g>
