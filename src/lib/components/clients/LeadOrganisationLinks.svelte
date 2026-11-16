<script lang="ts">
	import { enhance } from '$app/forms';
	import { quietButtonClasses } from '$lib/components/site/formStyles';
	import { organisationHref, organisationPages } from '$lib/components/organisations/organisationPages';

	let { organisationId }: { organisationId: string | null } = $props();
</script>

{#if organisationId === null}
	<form method="POST" action="?/openOrganisation" use:enhance>
		<button type="submit" class={quietButtonClasses}>Open its organisation</button>
	</form>
{:else}
	<a href={organisationHref(organisationId, organisationPages.domain)} class={quietButtonClasses}>Domain</a>
	<a href={organisationHref(organisationId)} class={quietButtonClasses}>Organisation</a>
{/if}
