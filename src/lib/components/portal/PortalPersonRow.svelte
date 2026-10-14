<script lang="ts">
	import PortalPersonActions from './PortalPersonActions.svelte';
	import { portalAccessLabels, type PortalPerson } from '$lib/portal/portalPerson';

	let { person, canManage }: { person: PortalPerson; canManage: boolean } = $props();

	const standing = $derived([person.role, person.email].filter(Boolean).join(' · '));
</script>

<li class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
	<div class="flex min-w-0 flex-col gap-0.5">
		<span class="flex flex-wrap items-center gap-2 text-sm text-chalk">
			{person.name}
			{#if person.isAdministrator}
				<span class="rounded-full border border-hairline px-2 py-0.5 font-display text-xs text-chalk/60">
					Administrator
				</span>
			{/if}
		</span>
		<span class="truncate text-xs text-chalk/60">{standing}</span>
		<span class="text-xs text-chalk/50">{portalAccessLabels[person.access]}</span>
	</div>
	{#if canManage}
		<PortalPersonActions {person} />
	{/if}
</li>
