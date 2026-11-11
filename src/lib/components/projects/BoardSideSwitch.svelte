<script lang="ts">
	import type { BoardSide } from '$lib/data/boardSide';
	import type { SideTab } from '$lib/data/boardSideTabs';

	let { sides, selected }: { sides: SideTab[]; selected: BoardSide } = $props();
</script>

<nav aria-label="Sides of the project" class="flex w-fit gap-1 rounded-full border border-hairline bg-night/40 p-1">
	{#each sides as side (side.side)}
		{@const isSelected = side.side === selected}
		<a
			href="?department={side.openingTab}"
			aria-current={isSelected ? 'page' : undefined}
			data-sveltekit-noscroll
			class={[
				'flex items-center gap-1.5 rounded-full px-4 py-1.5 font-display text-sm transition',
				isSelected ? 'bg-carriage text-chalk' : 'text-chalk/50 hover:text-chalk'
			]}
		>
			{side.label}
			<span class={['rounded-full px-1.5 text-xs text-chalk/60', isSelected ? 'bg-night/60' : 'bg-carriage']}>
				{side.openTaskCount}
			</span>
		</a>
	{/each}
</nav>
