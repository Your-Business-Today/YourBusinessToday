<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import type { BadgeTone } from '$lib/components/site/badgeTones';
	import { describeKitStanding, kitStanding, kitStandings, type KitStanding } from '$lib/data/kitVersion';

	let {
		repositoryUrl,
		kitVersion,
		kitVersionReadAt,
		latestKitVersion
	}: {
		repositoryUrl: string;
		kitVersion: string;
		kitVersionReadAt: string | null;
		latestKitVersion: string;
	} = $props();

	const reading = $derived({
		hasRepository: repositoryUrl !== '',
		isRead: kitVersionReadAt !== null,
		kitVersion,
		latestKitVersion
	});
	const standing = $derived(kitStanding(reading));

	const standingTones: Record<KitStanding, BadgeTone> = {
		no_repository: 'neutral',
		not_read: 'neutral',
		no_kit: 'negative',
		unknown_latest: 'neutral',
		current: 'positive',
		behind: 'warning'
	};

	const standingLabels: Record<KitStanding, string> = $derived({
		no_repository: '',
		not_read: 'Kit not read',
		no_kit: 'No kit',
		unknown_latest: `Kit ${kitVersion}`,
		current: `Kit ${kitVersion}`,
		behind: `Kit ${kitVersion} · behind`
	});
</script>

{#if standing !== kitStandings.noRepository}
	<span title={describeKitStanding(standing, reading)} class="inline-flex">
		<Badge label={standingLabels[standing]} tone={standingTones[standing]} />
	</span>
{/if}
