<script lang="ts">
	import CoverSleeve from './CoverSleeve.svelte';
	import Wireframe from './Wireframe.svelte';
	import type { CoverPlacement } from '$lib/data/blueprint/albumPlacement';
	import type { Screen } from '$lib/data/blueprint/siteMap';

	let {
		screen,
		placement,
		isChosen,
		onChoose
	}: { screen: Screen; placement: CoverPlacement; isChosen: boolean; onChoose: () => void } = $props();
</script>

<CoverSleeve
	label={screen.route}
	caption={screen.route}
	subcaption={screen.entityName ?? screen.section}
	{placement}
	{isChosen}
	{onChoose}
>
	<Wireframe layout={screen.layout} />
</CoverSleeve>
