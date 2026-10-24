<script lang="ts">
	let { label }: { label: string } = $props();
</script>

<span
	class="rounded bg-signal px-2 py-0.5 font-display text-[0.65rem] font-semibold tracking-wider text-night
		uppercase"
>
	{label}
</span>
