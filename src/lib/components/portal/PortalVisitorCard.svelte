<script lang="ts">
	import PersonInitials from '$lib/components/workspace/PersonInitials.svelte';
	import type { PortalVisitor } from '$lib/portal/portalVisitor';

	let { visitor }: { visitor: PortalVisitor } = $props();

	const standing = $derived(
		visitor.role === '' ? visitor.organisationName : `${visitor.role}, ${visitor.organisationName}`
	);
</script>

<div class="flex min-w-0 items-center gap-3 px-4 py-4">
	<PersonInitials name={visitor.personName} />
	<div class="flex min-w-0 flex-col gap-0.5">
		<p class="truncate font-display text-chalk">{visitor.personName}</p>
		<p class="truncate text-sm text-chalk/70">{standing}</p>
		<p class="truncate text-xs text-chalk/50">{visitor.emailAddress}</p>
	</div>
</div>
