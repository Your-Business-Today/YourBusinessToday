<script lang="ts">
	import type { NavigationLink } from '$lib/components/site/siteNavigation';

	let { link, isCurrent }: { link: NavigationLink; isCurrent: boolean } = $props();

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
	{link.label}
</a>
