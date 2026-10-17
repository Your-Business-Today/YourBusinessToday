<script lang="ts">
	let {
		dueDate,
		isDone,
		isLabelled = false
	}: { dueDate: string; isDone: boolean; isLabelled?: boolean } = $props();

	const isOverdue = $derived(!isDone && new Date(dueDate) < startOfToday());
	const formattedDate = $derived(
		new Date(dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
	);
	const plainLabel = $derived(isLabelled ? `Due ${formattedDate}` : formattedDate);

	function startOfToday(): Date {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return today;
	}
</script>

<span
	class={`font-display text-xs whitespace-nowrap ${isOverdue ? 'text-signal' : 'text-chalk/50'}`}
>
	{isOverdue ? `Overdue · ${formattedDate}` : plainLabel}
</span>
