<script lang="ts">
	import { siteMapAudienceHref, siteMapAudiences, type SiteMapAudience } from './blueprintViews';

	let { projectId, audience }: { projectId: string; audience: SiteMapAudience } = $props();

	const choices = [
		{ audience: siteMapAudiences.person, label: 'What a person sees', hint: 'Screens' },
		{ audience: siteMapAudiences.claude, label: 'What a Claude can do', hint: 'MCP map' }
	];
</script>

<nav aria-label="Who the map is for" class="grid grid-cols-2 gap-1 rounded-xl border border-hairline bg-carriage p-1 sm:inline-grid">
	{#each choices as choice (choice.audience)}
		{@const isCurrent = choice.audience === audience}
		<a
			href={siteMapAudienceHref(projectId, choice.audience)}
			aria-current={isCurrent ? 'page' : undefined}
			class={[
				'flex flex-col rounded-lg px-4 py-1.5 transition',
				isCurrent ? 'bg-go text-night' : 'text-chalk/70 hover:text-go'
			]}
		>
			<span class="font-display text-sm">{choice.label}</span>
			<span class={['text-[11px]', isCurrent ? 'text-night/70' : 'text-chalk/40']}>{choice.hint}</span>
		</a>
	{/each}
</nav>
