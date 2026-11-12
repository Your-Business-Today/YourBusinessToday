<script lang="ts">
	import LineIcon from '$lib/components/site/LineIcon.svelte';
	import type { FrameSectionLink } from './frameGroups';

	let { link, isCurrent }: { link: FrameSectionLink; isCurrent: boolean } = $props();

	const toneClasses = $derived(
		isCurrent ? 'font-semibold text-chalk' : 'font-medium text-chalk-subtle'
	);
</script>

<a
	href={link.href}
	aria-current={isCurrent ? 'page' : undefined}
	class={`flex items-center gap-3 rounded px-3 py-3.5 text-sm transition hover:bg-carriage-raised
		hover:text-chalk md:py-2 ${toneClasses}`}
>
	<LineIcon kind={link.icon} class="h-4 w-4 shrink-0" />
	<span class="truncate">{link.label}</span>
</a>
