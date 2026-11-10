<script lang="ts">
	import type { EarningType } from '$lib/data/taxCalculator/takeHomeInputs';

	let { earningType }: { earningType: EarningType } = $props();

	const iconPaths: Record<EarningType, string[]> = {
		employed: ['M4 8h16v11H4z', 'M9 8V5h6v3', 'M4 13h16'],
		selfEmployed: ['M12 3v5M12 16v5M3 12h5M16 12h5', 'M6.5 6.5l2.5 2.5M15 15l2.5 2.5M17.5 6.5L15 9M9 15l-2.5 2.5'],
		both: ['M12 3l9 5-9 5-9-5z', 'M3 13l9 5 9-5', 'M3 17l9 5 9-5']
	};
</script>

<svg viewBox="0 0 24 24" class="size-6 fill-none stroke-current" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
	{#each iconPaths[earningType] as path (path)}
		<path d={path} />
	{/each}
</svg>
