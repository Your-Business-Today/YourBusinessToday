<script lang="ts">
	import type { DeployFilter } from '$lib/data/deployHistoryFilter';

	let { filter = $bindable(), onchange }: { filter: DeployFilter; onchange: () => void } = $props();

	const inputClasses =
		'min-w-0 rounded-lg border border-hairline bg-carriage px-3 py-1.5 text-sm text-chalk outline-none focus:border-go';
</script>

<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
	<input
		bind:value={filter.words}
		oninput={onchange}
		type="search"
		placeholder="Search what went live"
		aria-label="Search the tasks each deploy carried"
		class={`${inputClasses} w-full sm:flex-1`}
	/>
	<label class="flex items-center gap-2 text-xs text-chalk/60">
		From
		<input bind:value={filter.fromDate} onchange={onchange} type="date" max={filter.toDate} class={inputClasses} />
	</label>
	<label class="flex items-center gap-2 text-xs text-chalk/60">
		To
		<input bind:value={filter.toDate} onchange={onchange} type="date" min={filter.fromDate} class={inputClasses} />
	</label>
</div>
