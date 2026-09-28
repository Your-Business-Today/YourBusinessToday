<script lang="ts">
	import { filterChipClasses } from './filterChipClasses';

	export type CountTone = 'attention' | 'plain';

	let {
		label,
		title,
		count,
		countTone,
		isSelected,
		onToggle
	}: {
		label: string;
		title: string;
		count: number;
		countTone: CountTone;
		isSelected: boolean;
		onToggle: () => void;
	} = $props();

	const countClasses: Record<CountTone, string> = {
		attention: 'bg-signal text-night',
		plain: 'bg-chalk/15 text-chalk'
	};
</script>

<button
	type="button"
	aria-pressed={isSelected}
	onclick={onToggle}
	{title}
	class={filterChipClasses(isSelected)}
>
	{label}
	{#if count > 0}
		<span class={`ml-1 rounded-full px-1.5 font-display text-xs ${countClasses[countTone]}`}>
			{count}
		</span>
	{/if}
</button>
