<script lang="ts">
	import type { Department } from '$lib/data/department';
	import type { DepartmentTab } from '$lib/data/departmentBoard';

	let { tabs, selected }: { tabs: DepartmentTab[]; selected: Department } = $props();
</script>

<nav aria-label="Departments" class="scrollbar-hidden -mx-4 flex gap-1 overflow-x-auto border-b border-hairline px-4">
	{#each tabs as tab (tab.department)}
		{@const isSelected = tab.department === selected}
		<a
			href="?department={tab.department}"
			aria-current={isSelected ? 'page' : undefined}
			data-sveltekit-noscroll
			class={[
				'-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 font-display text-sm transition',
				isSelected ? 'border-go text-chalk' : 'border-transparent text-chalk/50 hover:text-chalk'
			]}
		>
			{tab.label}
			<span class="rounded-full bg-carriage px-1.5 text-xs text-chalk/60">{tab.openTaskCount}</span>
		</a>
	{/each}
</nav>
