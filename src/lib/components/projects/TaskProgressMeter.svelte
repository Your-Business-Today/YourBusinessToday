<script lang="ts">
	let { completionPercent }: { completionPercent: number } = $props();
</script>

<span title={`${completionPercent}% done`} class="flex items-center gap-1.5">
	<span class="h-1.5 w-16 overflow-hidden rounded-full bg-chalk/10">
		<span class="block h-full rounded-full bg-go" style={`width: ${completionPercent}%`}></span>
	</span>
	<span class="font-display text-xs tabular-nums text-chalk/50">{completionPercent}% done</span>
</span>
