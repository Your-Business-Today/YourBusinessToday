<script lang="ts">
	import { projectHeaderClasses, wideScreenOnlyClasses, type TableColumn } from './projectTableStyles';

	let { columns }: { columns: TableColumn[] } = $props();
</script>

<li aria-hidden="true" class={projectHeaderClasses}>
	{#each columns as column (column.label)}
		<span class={column.isWideOnly ? wideScreenOnlyClasses : ''}>{column.label}</span>
	{/each}
</li>
