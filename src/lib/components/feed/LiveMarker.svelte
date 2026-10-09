<script lang="ts">
	import { formatBritishTime } from '$lib/data/britishDate';

	let { readAt, isRefreshing }: { readAt: string; isRefreshing: boolean } = $props();

	const readAtLabel = $derived(formatBritishTime(readAt));
</script>

<span
	title={isRefreshing ? 'Checking for new events' : `Up to date as of ${readAtLabel}; checks every half minute`}
	class="flex items-center gap-1.5 rounded-full border border-go/40 px-2.5 py-0.5 font-display text-xs text-go"
>
	<span class={['h-1.5 w-1.5 rounded-full bg-go', isRefreshing ? 'animate-ping' : 'animate-pulse']}></span>
	Live · {readAtLabel}
</span>
