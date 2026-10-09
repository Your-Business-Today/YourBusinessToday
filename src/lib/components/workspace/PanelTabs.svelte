<script lang="ts">
	import TabStrip, { type Tab } from './TabStrip.svelte';

	let { tabs, selectedKey = $bindable() }: { tabs: Tab[]; selectedKey: string } = $props();
</script>

<div class="lg:hidden">
	<TabStrip {tabs} bind:selectedKey />
</div>
