<script lang="ts">
	let {
		label,
		description,
		isOn,
		onToggle
	}: { label: string; description: string; isOn: boolean; onToggle: (isOn: boolean) => void } = $props();

	function toggleFromSwitch(event: Event & { currentTarget: HTMLInputElement }): void {
		const toggle = event.currentTarget;
		onToggle(toggle.checked);
	}
</script>

<label class="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-hairline p-4">
	<span class="flex flex-col gap-1">
		<span class="text-sm font-medium text-chalk">{label}</span>
		<span class="text-sm text-chalk/55">{description}</span>
	</span>
	<input type="checkbox" role="switch" class="peer sr-only" checked={isOn} onchange={toggleFromSwitch} />
	<span
		class="relative mt-0.5 h-7 w-12 shrink-0 rounded-full bg-hairline transition peer-checked:bg-signal
			peer-focus-visible:ring-2 peer-focus-visible:ring-go after:absolute after:top-1 after:left-1 after:size-5
			after:rounded-full after:bg-chalk after:transition peer-checked:after:translate-x-5"
		aria-hidden="true"
	></span>
</label>
