<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import ChevronIcon from '$lib/components/site/ChevronIcon.svelte';
	import { groupToneClasses } from './internalWorkStyles';
	import type { InternalWorkGroup } from './internalWorkGroups';

	let {
		group,
		isFolded,
		onToggle,
		onAddItem
	}: { group: InternalWorkGroup; isFolded: boolean; onToggle: () => void; onAddItem: () => void } = $props();

	const toneClasses = $derived(groupToneClasses[group.department] ?? '');
	const foldLabel = $derived(isFolded ? `Show ${group.label}` : `Fold ${group.label} away`);
</script>

<div class="flex flex-wrap items-center justify-between gap-2">
	<h3 class={['border-l-4 pl-2', toneClasses]}>
		<button
			type="button"
			onclick={onToggle}
			aria-expanded={!isFolded}
			aria-label={foldLabel}
			title={foldLabel}
			class="flex items-center gap-2 font-display text-base font-semibold"
		>
			<ChevronIcon isOpen={!isFolded} />
			{group.label}
			<span class="text-xs font-normal text-chalk-subtle">{group.openItemCount} open</span>
		</button>
	</h3>
	<Button onclick={onAddItem} look="ghost">+ Add item</Button>
</div>
