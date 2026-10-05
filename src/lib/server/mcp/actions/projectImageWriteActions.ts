import { assignProjectImage } from '$lib/server/projectImages/assignProjectImage';
import { deleteProjectImage } from '$lib/server/projectImages/deleteProjectImage';
import { findProjectImage } from '$lib/server/projectImages/findProjectImage';
import { noSuchProject } from './describeProject';
import { noSuchProjectImage } from './describeProjectImages';
import { noSuchTask } from './describeTask';
import { objectSchema, readText, textField } from '../actionTypes';
import { reachableProject, reachableTask } from '../projectAccess';
import type { McpAction } from '../actionTypes';

const imageIdField = textField('The image id, as find_project_images lists it');

export const projectImageWriteActions: McpAction[] = [
	{
		name: 'assign_project_image',
		area: 'projects',
		audience: 'everyone',
		isWrite: true,
		summary: 'put an unassigned image from a project’s bank on one of its tasks',
		guidance:
			'The image becomes the task’s attachment, under the person who uploaded it, and leaves ' +
			'the bank. The task must be on the same project as the image. Say on the task what the ' +
			'image shows.',
		inputSchema: objectSchema(
			{ taskId: textField('The task to put the image on'), imageId: imageIdField },
			['taskId', 'imageId']
		),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const image = await findProjectImage(caller.supabase, task.projectId, readText(input, 'imageId'));
			if (image === null) return noSuchProjectImage;
			const isAssigned = await assignProjectImage(caller.supabase, image, task);
			if (!isAssigned) return noSuchProjectImage;
			return `"${image.filename}" attached to "${task.title}" (attachment id: ${image.id}).`;
		}
	},
	{
		name: 'remove_project_image',
		area: 'projects',
		audience: 'everyone',
		isWrite: true,
		summary: 'delete an unassigned image from a project’s bank',
		guidance: 'This permanently deletes the image. It cannot be undone.',
		inputSchema: objectSchema(
			{ projectId: textField('The project id'), imageId: imageIdField },
			['projectId', 'imageId']
		),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			const image = await findProjectImage(caller.supabase, project.id, readText(input, 'imageId'));
			if (image === null) return noSuchProjectImage;
			await deleteProjectImage(caller.supabase, image);
			return `"${image.filename}" removed from ${project.name}’s image bank.`;
		}
	}
];
