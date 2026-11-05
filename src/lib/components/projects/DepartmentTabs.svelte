<script lang="ts">
	import type { BoardTab } from '$lib/data/boardTab';
	import type { DepartmentTab } from '$lib/data/departmentBoard';

	let { tabs, selected }: { tabs: DepartmentTab[]; selected: BoardTab } = $props();
</script>

<nav aria-label="Departments" class="scrollbar-hidden -mx-4 flex gap-1 overflow-x-auto border-b border-hairline px-4">
	{#each tabs as tab (tab.tab)}
		{@const isSelected = tab.tab === selected}
		{@const isOpenBugs = tab.tab === 'bugs' && tab.openTaskCount > 0}
		<a
			href="?department={tab.tab}"
			aria-current={isSelected ? 'page' : undefined}
			data-sveltekit-noscroll
			class={[
				'-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 font-display text-sm transition',
				isSelected ? 'border-go text-chalk' : 'border-transparent text-chalk/50 hover:text-chalk'
			]}
		>
			{tab.label}
			<span
				class={[
					'rounded-full px-1.5 text-xs',
					isOpenBugs ? 'bg-signal/15 text-signal' : 'bg-carriage text-chalk/60'
				]}>{tab.openTaskCount}</span
			>
		</a>
	{/each}
</nav>
