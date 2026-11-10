<script lang="ts">
	type IconName = 'chart' | 'wallet' | 'calendar' | 'receipt' | 'shield' | 'digital';

	let { name, toneClasses = 'bg-go/10 text-go' }: { name: IconName; toneClasses?: string } = $props();

	const iconPaths: Record<IconName, string[]> = {
		chart: ['M5 19V11', 'M10 19V7', 'M15 19V13', 'M20 19V4'],
		wallet: ['M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4z', 'M4 7l11-3v3', 'M16 13h2'],
		calendar: ['M4 6h16v14H4z', 'M4 10h16', 'M8 3v5M16 3v5'],
		receipt: ['M6 3h12v18l-3-2-3 2-3-2-3 2z', 'M9 8h6M9 12h6M9 16h3'],
		shield: ['M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', 'M9 12l2 2 4-4'],
		digital: ['M4 5h16v11H4z', 'M9 20h6', 'M12 16v4', 'M8 10l2 2-2 2M13 14h3']
	};
</script>

<span class={`grid size-10 shrink-0 place-items-center rounded-xl ${toneClasses}`} aria-hidden="true">
	<svg viewBox="0 0 24 24" class="size-5 fill-none stroke-current" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
		{#each iconPaths[name] as path (path)}<path d={path} />{/each}
	</svg>
</span>
