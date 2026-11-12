<script lang="ts">
	import LineIcon from './LineIcon.svelte';
	import { portalAddress } from '$lib/portal/portalAddress';

	let { class: extraClasses = '' }: { class?: string } = $props();
</script>

<a
	href={portalAddress.origin}
	target="_blank"
	rel="noopener"
	class="inline-flex items-center gap-1.5 font-display text-sm text-chalk/80 transition hover:text-chalk {extraClasses}"
>
	Portal
	<LineIcon kind="externalLink" class="h-4 w-4" />
	<span class="sr-only">(opens in a new tab)</span>
</a>
