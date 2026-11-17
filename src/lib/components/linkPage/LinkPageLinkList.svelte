<script lang="ts">
	import LineIcon from '$lib/components/site/LineIcon.svelte';
	import type { LinkPageLink } from '$lib/data/linkPages/linkPage';
	import { linkPageIcons } from './linkPageIcons';

	let { links }: { links: LinkPageLink[] } = $props();

	const isWebsite = (link: LinkPageLink) => link.kind === 'website';
</script>

<ul class="flex flex-col gap-3">
	{#each links as link (link.address)}
		<li>
			<a
				href={link.address}
				target={isWebsite(link) ? '_blank' : undefined}
				rel={isWebsite(link) ? 'noopener' : undefined}
				class="flex min-h-14 items-center gap-3 rounded-xl border border-hairline bg-carriage px-5 py-4 font-medium text-chalk transition hover:border-signal hover:bg-carriage-raised focus-visible:outline-2 focus-visible:outline-signal"
			>
				<LineIcon kind={linkPageIcons[link.kind]} class="h-5 w-5 shrink-0 text-chalk-subtle" />
				<span class="flex-1">{link.label}</span>
				<LineIcon kind="arrow" class="h-4 w-4 shrink-0 text-chalk-faint" />
			</a>
		</li>
	{/each}
</ul>
