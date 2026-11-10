<script lang="ts">
	import { keyboardKeys } from '$lib/client/keyboardKeys';
	import type { PlacedPart } from '$lib/data/companyContext/contextMapLayout';

	let {
		placed,
		isSelected,
		isLinked,
		onSelect
	}: { placed: PlacedPart; isSelected: boolean; isLinked: boolean; onSelect: () => void } = $props();

	const labelInset = { x: 10, y: 16 };
	const unsureDashes = '3 3';

	function boxClasses(): string {
		if (isSelected) return 'fill-go stroke-go';
		if (isLinked) return 'fill-night stroke-caution';
		return 'fill-night stroke-hairline hover:stroke-go';
	}

	function selectOnEnter(event: KeyboardEvent) {
		if (event.key === keyboardKeys.enter) onSelect();
	}
</script>

<g
	role="button"
	tabindex="0"
	aria-pressed={isSelected}
	aria-label={`${placed.name}, ${placed.kindName}`}
	onclick={onSelect}
	onkeydown={selectOnEnter}
	class="cursor-pointer outline-none"
>
	<rect
		x={placed.x}
		y={placed.y}
		width={placed.width}
		height={placed.height}
		rx="8"
		stroke-dasharray={placed.isUnsure ? unsureDashes : undefined}
		class={`transition ${boxClasses()}`}
	/>
	<text
		x={placed.x + labelInset.x}
		y={placed.y + labelInset.y}
		class={['pointer-events-none text-[12px]', isSelected ? 'fill-night font-medium' : 'fill-chalk/85']}
	>
		{placed.reviewMark}{placed.title}
	</text>
	<text
		x={placed.x + placed.width - labelInset.x}
		y={placed.y + labelInset.y}
		text-anchor="end"
		class={['pointer-events-none text-[10px]', isSelected ? 'fill-night/70' : 'fill-chalk/40']}
	>
		{placed.kindName}
	</text>
</g>
