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
			'0 turns the cadence off. The database kind and details record where the project’s data ' +
			'lives and where its migrations are; the repository’s own GitHub workflow runs each ' +
			'migration a merge adds (an Azure SQL project needs its server and name).',
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
				databaseUser: textField(
					`The Azure SQL login sqlcmd signs in as; an empty string clears it for an Entra-only server, signed in as the az login user${keepText}`
				),
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
