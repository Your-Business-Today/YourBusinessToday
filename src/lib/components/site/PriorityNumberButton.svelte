<script lang="ts">
	let {
		label,
		itemName,
		class: numberClasses,
		onclick
	}: { label: string | number; itemName: string; class: string; onclick: () => void } = $props();
</script>

<button
	type="button"
	{onclick}
	title="Set priority"
	aria-label={`Set the priority of ${itemName}, now ${label}`}
	class={`${numberClasses} transition hover:text-go`}
>
	{label}
</button>
