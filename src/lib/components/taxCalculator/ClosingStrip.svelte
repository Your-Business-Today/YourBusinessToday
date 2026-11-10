<script lang="ts">
	import { outlineButtonClasses } from './calculatorStyles';

	let { canExport, onExport }: { canExport: boolean; onExport: () => void } = $props();
</script>

<div class="flex flex-col items-start justify-between gap-5 border-t border-hairline pt-8 sm:flex-row sm:items-center">
	<div class="flex items-center gap-4">
		<span class="font-display text-3xl text-signal" aria-hidden="true">✳</span>
		<div>
			<p class="font-display text-lg font-medium">Good decisions start with a clear picture.</p>
			<p class="text-sm text-chalk/55">Built by Your Business Today.</p>
		</div>
	</div>
	<button type="button" disabled={!canExport} onclick={onExport} class={`${outlineButtonClasses} disabled:opacity-40`}>
		Take your numbers with you <span aria-hidden="true">↓</span>
	</button>
</div>
