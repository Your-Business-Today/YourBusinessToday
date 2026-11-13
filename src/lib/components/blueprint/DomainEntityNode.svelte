<script lang="ts">
	import { keyboardKeys } from '$lib/client/keyboardKeys';
	import { domainEntityKinds } from '$lib/data/blueprint/domainModel';
	import { nodeOutline } from '$lib/data/blueprint/domainNodeShapes';
	import type { PlacedEntity } from '$lib/data/blueprint/domainLayout';

	let {
		placed,
		isSelected,
		isRelated,
		onSelect
	}: { placed: PlacedEntity; isSelected: boolean; isRelated: boolean; onSelect: () => void } = $props();

	const labelInset = { x: 10, y: 16 };
	const rootMark = '◆ ';
	const isKeptInItsOwnRight = $derived(placed.kind === domainEntityKinds.record && !placed.isNested);

	function boxClasses(): string {
		if (isSelected) return 'fill-go stroke-go';
		if (isRelated) return 'fill-night stroke-caution';
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
	aria-label={placed.title}
	onclick={onSelect}
	onkeydown={selectOnEnter}
	class="cursor-pointer outline-none"
>
	<path d={nodeOutline(placed.kind, placed)} class={`transition ${boxClasses()}`} />
	<text
		x={placed.x + labelInset.x}
		y={placed.y + labelInset.y}
		class={['pointer-events-none text-[12px]', isSelected ? 'fill-night font-medium' : 'fill-chalk/85']}
	>
		{isKeptInItsOwnRight ? rootMark : ''}{placed.title}
	</text>
</g>
