<script lang="ts">
	import OrganisationDomainBody from '$lib/components/organisations/domain/OrganisationDomainBody.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { framePageLabels } from '$lib/components/frame/moduleFolders';
	import { organisationDomainMessages } from '$lib/components/organisations/domain/organisationDomainMessages';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const domainTitle = framePageLabels.domain;
	const organisation = $derived(data.organisation);
	const messages = $derived(organisationDomainMessages(organisation.name));
</script>

<svelte:head>
	<title>{domainTitle} — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={[]} title={domainTitle}>
	<p class="text-sm text-chalk-subtle">{messages.introduction}</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<OrganisationDomainBody {organisation} reading={data} />
</div>
