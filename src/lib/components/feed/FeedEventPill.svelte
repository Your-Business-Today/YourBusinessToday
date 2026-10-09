<script lang="ts">
	import { feedEventLabels, type FeedEventKind } from '$lib/data/feedEventKind';

	let { kind }: { kind: FeedEventKind } = $props();

	const pillStyles: Record<FeedEventKind, string> = {
		task_raised: 'border-hairline text-chalk/70',
		task_started: 'border-caution/60 text-caution',
		task_put_on_hold: 'border-signal/50 text-signal/90',
		task_returned_to_backlog: 'border-hairline text-chalk/50',
		pull_request_opened: 'border-daylight/50 text-daylight',
		task_done: 'border-go/60 bg-go/10 text-go'
	};
</script>

<span
	class={`w-24 shrink-0 truncate rounded-full border px-2 py-0.5 text-center font-display text-xs sm:w-28 ${pillStyles[kind]}`}
>
	{feedEventLabels[kind]}
</span>
