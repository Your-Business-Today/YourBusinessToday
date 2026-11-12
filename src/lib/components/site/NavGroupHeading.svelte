<script lang="ts">
	let { label, class: extraClasses = '' }: { label: string; class?: string } = $props();
</script>

<p class="px-3 pb-1 font-display text-xs tracking-widest text-chalk/40 uppercase {extraClasses}">
	{label}
</p>
