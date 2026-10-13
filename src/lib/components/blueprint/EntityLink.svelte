<script lang="ts">
	let {
		entityName,
		label = entityName,
		onSelect
	}: { entityName: string; label?: string; onSelect: (entityName: string) => void } = $props();
</script>

<button type="button" class="text-go hover:underline" onclick={() => onSelect(entityName)}>{label}</button>
