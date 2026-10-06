<script lang="ts">
	import { describeKitStanding, kitStanding, kitStandings, type KitStanding } from '$lib/data/kitVersion';

	let {
		repositoryUrl,
		kitVersion,
		latestKitVersion
	}: { repositoryUrl: string; kitVersion: string; latestKitVersion: string } = $props();

	const reading = $derived({ hasRepository: repositoryUrl !== '', kitVersion, latestKitVersion });
	const standing = $derived(kitStanding(reading));

	const standingStyles: Record<KitStanding, string> = {
		no_repository: '',
		no_kit: 'border-signal/60 text-signal',
		unknown_latest: 'border-hairline text-chalk/60',
		current: 'border-go/40 text-go/80',
		behind: 'border-caution/70 bg-caution/10 text-caution'
	};

	const standingLabels: Record<KitStanding, string> = $derived({
		no_repository: '',
		no_kit: 'No kit',
		unknown_latest: `Kit ${kitVersion}`,
		current: `Kit ${kitVersion}`,
		behind: `Kit ${kitVersion} · behind`
	});
</script>

{#if standing !== kitStandings.noRepository}
	<span
		title={describeKitStanding(standing, reading)}
		class={`rounded-full border px-2.5 py-0.5 font-display text-xs whitespace-nowrap ${standingStyles[standing]}`}
	>
		{standingLabels[standing]}
	</span>
{/if}
