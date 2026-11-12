<script lang="ts">
	let { signedInAs }: { signedInAs: string } = $props();
</script>

<p
	title={signedInAs}
	class="truncate border-t border-hairline pt-4 text-center text-sm font-medium text-chalk-subtle"
>
	{signedInAs}
</p>
