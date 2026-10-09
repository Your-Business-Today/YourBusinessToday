<script lang="ts">
	let { fontSize = 20 }: { fontSize?: number } = $props();
</script>

<span
	class="font-display leading-none font-bold tracking-tight text-chalk"
	style:font-size={`${fontSize}px`}
	aria-label="Your Business Today"
>
	YBT<span class="text-signal">.</span>
</span>
