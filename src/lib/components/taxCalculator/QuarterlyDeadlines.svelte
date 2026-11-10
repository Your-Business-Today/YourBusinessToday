<script lang="ts">
	const quarterlyDeadlines = [
		{ quarter: 'Q1', period: '6 Apr – 5 Jul', dueBy: '7 Aug' },
		{ quarter: 'Q2', period: '6 Jul – 5 Oct', dueBy: '7 Nov' },
		{ quarter: 'Q3', period: '6 Oct – 5 Jan', dueBy: '7 Feb' },
		{ quarter: 'Q4', period: '6 Jan – 5 Apr', dueBy: '7 May' }
	];
</script>

<ul class="grid grid-cols-2 gap-2 text-xs">
	{#each quarterlyDeadlines as deadline (deadline.quarter)}
		<li class="flex flex-col rounded-xl bg-night/60 px-3 py-2">
			<span class="font-mono text-sky">{deadline.quarter} · due {deadline.dueBy}</span>
			<span class="text-chalk/55">{deadline.period}</span>
		</li>
	{/each}
</ul>
