import type { SupabaseClient } from '@supabase/supabase-js';
import { doneTaskStatus } from '$lib/data/taskStatus';
import { isTaskAutocomplete, parseGoalAutocomplete, parseTaskAutocomplete } from '$lib/data/autocomplete';
import { openGoalStatus } from '$lib/data/goalStatus';
import type { RegisterGoal, RegisterProject, RegisterTask } from '$lib/data/autocompleteRegister';

type Row = Record<string, unknown>;

/** Every open goal and open task on the given projects, in project priority order, each marked autocomplete or not. */
export async function getAutocompleteRegister(
	supabase: SupabaseClient,
	projectIds: string[]
): Promise<RegisterProject[]> {
	if (projectIds.length === 0) return [];
	const projects = supabase.from('projects').select('id, name, priority').in('id', projectIds);
	const goals = supabase.from('goals').select('id, project_id, title, status, is_autocomplete');
	const tasks = supabase.from('tasks').select('id, project_id, goal_id, title, is_autocomplete');
	const [projectRows, goalRows, taskRows] = await Promise.all([
		selectRows(projects.order('priority')),
		selectRows(goals.in('project_id', projectIds).order('priority')),
		selectRows(tasks.in('project_id', projectIds).neq('status', doneTaskStatus).order('priority'))
	]);
	return projectRows.map((project) => registerProject(project, goalRows, taskRows));
}

async function selectRows(query: PromiseLike<{ data: Row[] | null; error: unknown }>): Promise<Row[]> {
	const { data, error } = await query;
	if (error) throw error;
	return data ?? [];
}

function registerProject(project: Row, goalRows: Row[], taskRows: Row[]): RegisterProject {
	const isOnProject = (row: Row) => row.project_id === project.id;
	const openGoals = goalRows.filter((row) => isOnProject(row) && row.status === openGoalStatus);
	const goals = openGoals.map(registerGoal);
	const tasks = taskRows.filter(isOnProject).map((row) => registerTask(row, goalRows));
	return { id: project.id as string, name: project.name as string, goals, tasks };
}

function registerGoal(row: Row): RegisterGoal {
	const isAutocomplete = parseGoalAutocomplete(row.is_autocomplete);
	return { id: row.id as string, title: row.title as string, isAutocomplete };
}

function registerTask(row: Row, goalRows: Row[]): RegisterTask {
	const goal = goalRows.find((goalRow) => goalRow.id === row.goal_id);
	const goalSetting = goal === undefined ? null : parseGoalAutocomplete(goal.is_autocomplete);
	const setting = parseTaskAutocomplete(row.is_autocomplete);
	return {
		id: row.id as string,
		title: row.title as string,
		goalId: (row.goal_id as string) ?? null,
		setting,
		isAutocomplete: isTaskAutocomplete(setting, goalSetting)
	};
}
