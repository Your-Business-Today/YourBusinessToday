<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import RaiseChangeButton from './RaiseChangeButton.svelte';
	import Wireframe from './Wireframe.svelte';
	import { changeSubjectKinds } from '$lib/data/blueprint/changeSubject';
	import { domainEntityHref } from './blueprintViews';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import type { Screen } from '$lib/data/blueprint/siteMap';

	let { screen, projectId, goals }: { screen: Screen; projectId: string; goals: Goal[] } = $props();
</script>

<DashboardPanel title={screen.route}>
	{#snippet actions()}
		<RaiseChangeButton subject={{ kind: changeSubjectKinds.screen, name: screen.route }} {goals} />
	{/snippet}
	<div class="grid gap-4 px-4 py-4 text-sm md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
		<div class="overflow-hidden rounded-lg border border-hairline bg-night/60">
			<Wireframe layout={screen.layout} />
		</div>
		<div class="flex min-w-0 flex-col gap-3">
			<p class="text-chalk/70">
				Drawn by <code class="font-mono text-xs text-chalk/90">{screen.viewFile || 'an unnamed view'}</code>
			</p>
			{#if screen.entityName !== null}
				<p class="text-chalk/70">
					A screen of the
					<a href={domainEntityHref(projectId, screen.entityName)} class="text-go hover:underline">{screen.entityName}</a>
					entity in the domain.
				</p>
			{/if}
			<section class="flex flex-col gap-1.5">
				<h3 class="font-display text-xs tracking-widest text-chalk/50 uppercase">What a user sees</h3>
				<pre class="overflow-x-auto rounded-lg border border-hairline bg-night p-3 font-mono text-xs whitespace-pre-wrap text-chalk/80">{screen.layout || 'Nothing drawn.'}</pre>
			</section>
		</div>
	</div>
</DashboardPanel>
