import { manageableOrganisation, notAnOrganisationManager } from '../organisationAccess';
import { noSuchProject } from './describeProject';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { reachableProject } from '../projectAccess';
import { setProjectOrganisation } from '$lib/server/organisations/setProjectOrganisation';
import type { McpAction } from '../actionTypes';

export const organisationProjectActions: McpAction[] = [
	{
		name: 'set_project_organisation',
		area: 'organisations',
		audience: 'everyone',
		isWrite: true,
		summary: 'put a project you are on under an organisation you manage, or take it out from under one',
		guidance:
			'The moment a project is under an organisation, everyone on that organisation — and on the one ' +
			'above it — is on the project. Leave organisationId out to take the project out from under its ' +
			'organisation, which takes those people off it; anyone invited to the project directly stays.',
		inputSchema: objectSchema(
			{
				projectId: textField('The project id'),
				organisationId: textField('The organisation to put it under — leave out for none')
			},
			['projectId']
		),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			const organisationId = readOptionalText(input, 'organisationId');
			const organisation = organisationId === null ? null : await manageableOrganisation(caller, organisationId);
			if (organisationId !== null && organisation === null) return notAnOrganisationManager;
			await setProjectOrganisation(caller.supabase, project.id, organisationId, project.organisationId);
			if (organisation === null) return `${project.name} is under no organisation now.`;
			return `${project.name} is under ${organisation.name}; everyone on it is on the project.`;
		}
	}
];
