<script lang="ts">
	import { fieldClasses } from '$lib/components/site/formStyles';
	import {
		databaseKindLabels,
		databaseKindOrder,
		databaseKinds,
		migrationsPathWhenUnset,
		parseDatabaseKind,
		type DatabaseKind
	} from '$lib/data/databaseKind';
	import { longestDatabaseDetail, type ProjectDatabase } from '$lib/data/projectDatabase';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let { database }: { database: ProjectDatabase } = $props();

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
	<SmallCapsField label="Database" class="max-w-48">
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
	</SmallCapsField>
	{#if hasDatabase}
		<SmallCapsField label="Migrations folder" class="max-w-64">
			<input
				name="migrationsPath"
				value={database.migrationsPath}
				placeholder={folderPlaceholder}
				maxlength={longestDatabaseDetail}
				class={fieldClasses}
			/>
		</SmallCapsField>
	{/if}
</div>
{#if isAzureSql}
	<div class="flex flex-wrap gap-4">
		<SmallCapsField label="SQL server" class="min-w-64 flex-1">
			<input
				name="databaseServer"
				value={database.server}
				required
				placeholder="the server’s full host name"
				maxlength={longestDatabaseDetail}
				class={fieldClasses}
			/>
		</SmallCapsField>
		<SmallCapsField label="Database name" class="max-w-48">
			<input name="databaseName" value={database.name} required maxlength={longestDatabaseDetail} class={fieldClasses} />
		</SmallCapsField>
		<SmallCapsField label="User" class="max-w-48">
			<input
				name="databaseUser"
				value={database.user}
				placeholder="blank when Entra-only"
				maxlength={longestDatabaseDetail}
				class={fieldClasses}
			/>
		</SmallCapsField>
	</div>
{/if}
{#if hasDatabase}
	<p class="text-sm text-chalk/50">
		A migration file a merge adds under that folder becomes a database task for the admin to run and
		confirm, under Projects › Database tasks.
	</p>
{/if}
