import { textField, proseField } from '$lib/server/mcp/actionTypes';
import { todoLimits, todoStatusOrder } from '$lib/data/todo';

export const todoIdField = textField('The to-do, as list_my_todos gives it');

export const todoFields = {
	title: textField(`What has to be done, in a few words (at most ${todoLimits.longestTitle} characters)`),
	notes: proseField(`Anything that helps whoever does it (at most ${todoLimits.longestNotes} characters)`),
	dueDate: textField('When it is due, as YYYY-MM-DD; empty to clear it'),
	status: textField(`One of ${todoStatusOrder.join(', ')}`)
};

export const todoPlaceFields = {
	taskId: textField(
		'The development task it was born out of and serves. It never holds that task up, and the ' +
			'task’s page lists it'
	),
	owner: textField(
		'Whose to-do it is: their email or account id, as list_project_people gives it. Leave it ' +
			'out for the person you are with. Say "nobody" for one anyone on the task’s project may ' +
			'take; that needs taskId'
	)
};
