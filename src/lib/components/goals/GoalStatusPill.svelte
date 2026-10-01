<script lang="ts">
	import { goalStatusLabels, type GoalStatus } from '$lib/data/goalStatus';

	let { status }: { status: GoalStatus } = $props();

	const pillStyles: Record<GoalStatus, string> = {
		open: 'border-hairline text-chalk/70',
		met: 'border-go/60 text-go',
		dropped: 'border-hairline text-chalk/40 line-through'
	};
</script>

<span class={`shrink-0 rounded-full border px-2 py-0.5 font-display text-[0.7rem] ${pillStyles[status]}`}>
	{goalStatusLabels[status]}
</span>
