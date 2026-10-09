<script lang="ts">
	let { title, onClose }: { title: string; onClose: () => void } = $props();
</script>

<div class="mb-5 flex items-center justify-between gap-4">
	<h2 class="font-display text-xl font-medium">{title}</h2>
	<button
		type="button"
		onclick={onClose}
		aria-label="Close"
		class="rounded-full border border-hairline px-3 py-1 text-sm text-chalk/60 transition
			hover:border-signal hover:text-signal"
	>
		✕
	</button>
</div>
