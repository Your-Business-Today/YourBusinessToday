<script lang="ts">
	export type Tab = { key: string; label: string; count: number | null };

	let { tabs, selectedKey = $bindable() }: { tabs: Tab[]; selectedKey: string } = $props();
</script>

<div role="tablist" class="scrollbar-hidden -mx-4 flex gap-1 overflow-x-auto border-b border-hairline px-4">
	{#each tabs as tab (tab.key)}
		{@const isSelected = tab.key === selectedKey}
		<button
			type="button"
			role="tab"
			aria-selected={isSelected}
			onclick={() => (selectedKey = tab.key)}
			class={[
				'-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 font-display text-sm transition',
				isSelected ? 'border-go text-chalk' : 'border-transparent text-chalk/50 hover:text-chalk'
			]}
		>
			{tab.label}
			{#if tab.count !== null}
				<span class="rounded-full bg-carriage px-1.5 text-xs text-chalk/60">{tab.count}</span>
			{/if}
		</button>
	{/each}
</div>
