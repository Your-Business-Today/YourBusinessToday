import { createProject } from '$lib/server/projects/createProject';
import { noSuchProject } from './describeProject';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { projectStatusLabels, projectStatusOrder } from '$lib/data/projectStatus';
import { reachableProject } from '../projectAccess';
import { parseProjectDetailsEdit } from './projectDetailsEdit';
import { databaseKindOrder } from '$lib/data/databaseKind';
import { updateProjectDetails } from '$lib/server/projects/updateProjectDetails';
import type { McpAction } from '../actionTypes';

const statusField = textField(`One of ${projectStatusOrder.join(', ')}`);
const databaseKindField = textField(`The database behind the site: one of ${databaseKindOrder.join(', ')} — leave out to keep what is there`);

const keepText = ' — leave out to keep what is there';

export const projectWriteActions: McpAction[] = [
	{
		name: 'create_project',
		area: 'projects',
		audience: 'everyone',
		isWrite: true,
		summary: 'start a new project that you own',
		guidance:
			'You own it and can hand it on; everyone you bring on to it manages it with you. It lands ' +
			'at the bottom of your board; call move_project or place_project to prioritise it.',
		inputSchema: objectSchema(
			{
				name: textField('What the project is called'),
				description: textField('What the project is for')
			},
			['name']
		),
		run: async (caller, input) => {
			const name = readOptionalText(input, 'name');
			if (name === null) return 'A project needs a name. Say what to call it and try again.';
			await createProject(caller.supabase, {
				name,
				description: readText(input, 'description'),
				ownerId: caller.accountId,
				createdBy: caller.accountId
			});
			return `Project "${name}" created. Call list_projects for its id.`;
		}
	},
	{
		name: 'update_project_details',
		area: 'projects',
		audience: 'everyone',
		isWrite: true,
		summary:
			'rename a project, rewrite its description, change its status, or say where its code lives and how often it is refactored',
		guidance:
			'The repository and the default branch are what the deploy count reads: every push to that ' +
			'branch of that repository is a deploy, and at refactorEveryDeploys of them a REFACTOR round ' +
			'is raised on the project as the reminder to run the repository’s refactor-round skill. ' +
			'0 turns the cadence off. The database kind and details are what the database task list ' +
			'reads: a migration file a merge adds under the migrations folder becomes a task for the ' +
			'admin to run, written as a sqlcmd for an Azure SQL project (server, name and user are ' +
			'needed) or as the file link and run-migration script for a Supabase one.',
		inputSchema: objectSchema(
			{
				projectId: textField('The project id'),
				name: textField(`A new name${keepText}`),
				description: textField(`A new description${keepText}`),
				status: statusField,
				repositoryUrl: textField(`Where the code lives${keepText}`),
				environmentUrl: textField(`Where the live site is${keepText}`),
				defaultBranch: textField(`The branch that deploys${keepText}`),
				refactorEveryDeploys: {
					type: 'number',
					description: `Deploys between refactor rounds, 0 for none${keepText}`
				},
				databaseKind: databaseKindField,
				databaseServer: textField(`The Azure SQL server’s full host name, as sqlcmd -S takes it${keepText}`),
				databaseName: textField(`The Azure SQL database name${keepText}`),
				databaseUser: textField(`The Azure SQL user sqlcmd signs in as${keepText}`),
				migrationsPath: textField(`The folder the migration files live in, such as api/Data/Migrations${keepText}`)
			},
			['projectId']
		),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			const edit = parseProjectDetailsEdit(input, project);
			if ('refusal' in edit) return edit.refusal;
			const { update } = edit;
			await updateProjectDetails(caller.supabase, project.id, update);
			return `${update.name} saved — ${projectStatusLabels[update.status]}.`;
		}
	}
];
