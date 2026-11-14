import { createProject } from '$lib/server/projects/createProject';
import { noSuchOrganisation, reachableOrganisation } from '../organisationAccess';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { validateNewProjectFields } from './newProjectFields';
import { internalProjectMeaning, leaveRepositoryBlankForInternal } from '$lib/data/internalProject';
import type { McpAction } from '../actionTypes';

export const projectCreateActions: McpAction[] = [
	{
		name: 'create_project',
		area: 'projects',
		audience: 'everyone',
		isWrite: true,
		summary: 'start a new project that you own',
		guidance:
			'You own it and can hand it on; everyone you bring on to it manages it with you. It joins your ' +
			'projects list below the others you own; call move_project or place_project to prioritise it. Name the ' +
			'organisation it is for — a client, one of its businesses, or Your Business Today — and everyone ' +
			'on that organisation is on the project at once; call list_organisations for the ids. Give repositoryUrl for ' +
			'software; leave it out for an internal project, ' + internalProjectMeaning + '. ' + leaveRepositoryBlankForInternal,
		inputSchema: objectSchema(
			{
				name: textField('What the project is called'),
				description: textField('What the project is for'),
				organisationId: textField('The organisation it is for, as list_organisations gives it — leave out for none'),
				repositoryUrl: textField('Where its code lives, such as https://github.com/owner/name — leave out for an internal project')
			},
			['name']
		),
		run: async (caller, input) => {
			const fieldRefusal = validateNewProjectFields(input);
			if (fieldRefusal !== null) return fieldRefusal;
			const name = readOptionalText(input, 'name');
			if (name === null) return 'A project needs a name. Say what to call it and try again.';
			const organisationId = readOptionalText(input, 'organisationId');
			const organisation = organisationId === null ? null : await reachableOrganisation(caller, organisationId);
			if (organisationId !== null && organisation === null) return noSuchOrganisation;
			await createProject(caller.supabase, {
				name,
				description: readText(input, 'description'),
				organisationId,
				repositoryUrl: readText(input, 'repositoryUrl'),
				ownerId: caller.accountId,
				createdBy: caller.accountId
			});
			return `Project "${name}" created. Call list_projects for its id.`;
		}
	}
];
