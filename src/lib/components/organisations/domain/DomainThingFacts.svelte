<script lang="ts">
	import { domainThingHref } from './domainTabs';
	import type { DomainThing } from '$lib/data/domainReading';

	let { thing, group, opening }: { thing: DomainThing; group: DomainThing | undefined; opening: string } = $props();

	const { identity, keptIn } = $derived(thing);
	const hasOpening = $derived(opening !== '');
</script>

{#if hasOpening || identity !== null || keptIn !== null || group !== undefined}
	<dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2">
		{#if hasOpening}
			<dt class="font-display text-xs text-chalk/50">What it is</dt>
			<dd class="min-w-0 break-words">{opening}</dd>
		{/if}
		{#if identity !== null}
			<dt class="font-display text-xs text-chalk/50">What makes one</dt>
			<dd class="min-w-0 break-words">{identity}</dd>
		{/if}
		{#if keptIn !== null}
			<dt class="font-display text-xs text-chalk/50">Kept in</dt>
			<dd class="min-w-0 break-words">{keptIn}</dd>
		{/if}
		{#if group !== undefined}
			<dt class="font-display text-xs text-chalk/50">Group</dt>
			<dd class="min-w-0 break-words"><a href={domainThingHref(group.slug)} class="hover:underline">{group.title}</a></dd>
		{/if}
	</dl>
{/if}
