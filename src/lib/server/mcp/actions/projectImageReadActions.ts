import { answerWithStoredFile } from './storedFileAnswer';
import { findProjectImage } from '$lib/server/projectImages/findProjectImage';
import { getProjectImages } from '$lib/server/projectImages/getProjectImages';
import { getProjectPeople } from '$lib/server/members/getProjectPeople';
import { matchesWords, noSuchProjectImage, projectImageLines } from './describeProjectImages';
import { noSuchProject } from './describeProject';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { reachableProject } from '../projectAccess';
import type { McpAction } from '../actionTypes';

const projectIdField = textField('The project id');

export const projectImageReadActions: McpAction[] = [
	{
		name: 'find_project_images',
		area: 'projects',
		audience: 'everyone',
		isWrite: false,
		summary: 'the images uploaded to a project that are not on a task yet, newest first',
		guidance:
			'Images a person uploaded on the project page wait here, in the project’s bank of ' +
			'unassigned images, usually for a task you are about to raise. Each line says how long ago ' +
			'it was uploaded and by whom. Open one with read_project_image to see what it shows, then ' +
			'put it on its task with assign_project_image. Once the task exists, the tool ' +
			'show_task_upload_box lets them add a file to it without leaving the chat.',
		inputSchema: objectSchema(
			{
				projectId: projectIdField,
				words: textField('Words from the file name to narrow the list — leave out to list them all')
			},
			['projectId']
		),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			const words = readOptionalText(input, 'words') ?? '';
			const images = await getProjectImages(caller.supabase, project.id);
			const people = await getProjectPeople(caller.supabase, project.id);
			const matching = images.filter((image) => matchesWords(image, words));
			return projectImageLines(project, matching, people).join('\n');
		}
	},
	{
		name: 'read_project_image',
		area: 'projects',
		audience: 'everyone',
		isWrite: false,
		summary: 'look at one unassigned image in a project’s bank',
		guidance:
			'Images up to 3 MB come back as the image itself; anything bigger comes back as a link ' +
			'that works for ten minutes.',
		inputSchema: objectSchema(
			{
				projectId: projectIdField,
				imageId: textField('The image id, as find_project_images lists it')
			},
			['projectId', 'imageId']
		),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			const image = await findProjectImage(caller.supabase, project.id, readText(input, 'imageId'));
			if (image === null) return noSuchProjectImage;
			return answerWithStoredFile(caller.supabase, image);
		}
	}
];
