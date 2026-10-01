<script lang="ts">
	let { completionPercent }: { completionPercent: number } = $props();
</script>

<span class="block h-1 w-full overflow-hidden rounded-full bg-night" aria-hidden="true">
	<span class="block h-full rounded-full bg-go transition-all" style={`width: ${completionPercent}%`}></span>
</span>
