<script lang="ts">
	import {
		databaseKindLabels,
		databaseKindOrder,
		databaseKinds,
		migrationsPathWhenUnset,
		parseDatabaseKind,
		type DatabaseKind
	} from '$lib/data/databaseKind';
	import { longestDatabaseDetail, type ProjectDatabase } from '$lib/data/projectDatabase';

	let {
		database,
		fieldClasses,
		labelClasses
	}: { database: ProjectDatabase; fieldClasses: string; labelClasses: string } = $props();

	let chosenKind: DatabaseKind | null = $state(null);

	const kind = $derived(chosenKind ?? database.kind);
	const isAzureSql = $derived(kind === databaseKinds.azureSql);
	const hasDatabase = $derived(kind !== databaseKinds.none);
	const folderPlaceholder = $derived(migrationsPathWhenUnset[kind]);

	function chooseKind(event: Event & { currentTarget: HTMLSelectElement }): void {
		const select = event.currentTarget;
		chosenKind = parseDatabaseKind(select.value);
	}
</script>

<div class="flex flex-wrap gap-4">
	<label class="flex max-w-48 flex-col gap-1">
		<span class={labelClasses}>Database</span>
		<select
			name="databaseKind"
			value={kind}
			onchange={chooseKind}
			class={fieldClasses}
		>
			{#each databaseKindOrder as kindValue (kindValue)}
				<option value={kindValue}>{databaseKindLabels[kindValue]}</option>
			{/each}
		</select>
	</label>
	{#if hasDatabase}
		<label class="flex max-w-64 flex-col gap-1">
			<span class={labelClasses}>Migrations folder</span>
			<input
				name="migrationsPath"
				value={database.migrationsPath}
				placeholder={folderPlaceholder}
				maxlength={longestDatabaseDetail}
				class={fieldClasses}
			/>
		</label>
	{/if}
</div>
{#if isAzureSql}
	<div class="flex flex-wrap gap-4">
		<label class="flex min-w-64 flex-1 flex-col gap-1">
			<span class={labelClasses}>SQL server</span>
			<input
				name="databaseServer"
				value={database.server}
				required
				placeholder="the server’s full host name"
				maxlength={longestDatabaseDetail}
				class={fieldClasses}
			/>
		</label>
		<label class="flex max-w-48 flex-col gap-1">
			<span class={labelClasses}>Database name</span>
			<input name="databaseName" value={database.name} required maxlength={longestDatabaseDetail} class={fieldClasses} />
		</label>
		<label class="flex max-w-48 flex-col gap-1">
			<span class={labelClasses}>User</span>
			<input name="databaseUser" value={database.user} required maxlength={longestDatabaseDetail} class={fieldClasses} />
		</label>
	</div>
{/if}
{#if hasDatabase}
	<p class="text-sm text-chalk/50">
		A migration file a merge adds under that folder becomes a database task for the admin to run and
		confirm, under Projects › Database tasks.
	</p>
{/if}
