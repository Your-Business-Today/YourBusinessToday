<script lang="ts">
	import { domainThingHref } from './domainTabs';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { DomainRule, DomainThing } from '$lib/data/domainReading';

	let {
		event,
		rules,
		thingTitles,
		addresses
	}: { event: DomainThing; rules: DomainRule[]; thingTitles: Map<string, string>; addresses: BusinessBrainAddresses } = $props();

	const { marksThingSlug, marksStatus, reactors } = $derived(event);
	const { roles, ruleSlugs } = $derived(reactors);
	const reactingRules = $derived(rules.filter((rule) => ruleSlugs.includes(rule.slug)));
	const hasReactors = $derived(roles.length + ruleSlugs.length > 0);
	const termClasses = 'font-display text-xs text-chalk/50';
	const valueClasses = 'min-w-0 break-words';
	const listSeparator = ', ';
</script>

{#if marksThingSlug !== null || hasReactors}
	<dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2">
		{#if marksThingSlug !== null}
			<dt class={termClasses}>Marks</dt>
			<dd class={valueClasses}>
				<a href={domainThingHref(marksThingSlug)} class="hover:underline">{thingTitles.get(marksThingSlug) ?? marksThingSlug}</a>
				{#if marksStatus !== null}reaching {marksStatus}{/if}
			</dd>
		{/if}
		{#if hasReactors}
			<dt class={termClasses}>Who reacts</dt>
			<dd class={valueClasses}>
				{roles.join(listSeparator)}{#if roles.length > 0 && reactingRules.length > 0}{listSeparator}{/if}
				{#each reactingRules as rule, index (rule.pageId)}
					{#if index > 0}{listSeparator}{/if}<a href={addresses.page(rule.pageId)} class="hover:underline">{rule.title}</a>
				{/each}
			</dd>
		{/if}
	</dl>
{/if}
