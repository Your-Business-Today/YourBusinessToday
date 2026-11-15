/** Rule 12 of the working doctrine: finished work is kept, whether a task or a whole project is being deleted. */
export const keepingDoctrine = [
	'12. Finished work is never deleted, in a build session or a chat: a task marked done is the',
	'    record of what was built, and delete_task refuses it. Delete only a task raised by mistake',
	'    or no longer wanted, on the person’s word. A task with subtasks is deleted in two calls:',
	'    the first, with the task id alone, deletes nothing and lists what is under it, finished and',
	'    open; show the person that list. Its finished subtasks are always kept, moved under a new',
	'    completed task you name for the work they finished. Its open subtasks go only when you say',
	'    so, after the person has seen them; one worth keeping is moved out first with',
	'    set_task_parent. read_task lists a task’s subtasks and where each stands. A project that',
	'    holds finished tasks is never deleted either: delete_project refuses it, and the project',
	'    is set to complete instead. delete_project is for a project created by mistake,',
	'    never a way of tidying up: with the project id alone it deletes nothing and says what the',
	'    project holds, and it goes ahead only when the project’s name is given back, once the',
	'    person has seen that.'
];
