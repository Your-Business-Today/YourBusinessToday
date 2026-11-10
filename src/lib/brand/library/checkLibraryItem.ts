import { checkLibraryFile } from './checkLibraryFile';
import { LibraryLimits } from './libraryLimits';
import { PostingFootings, postingFootings, type LibraryItemGiven, type PostingFooting } from './libraryItem';
import { validateIsoDate } from '$lib/data/books/isoDate';

type Input = Record<string, unknown>;

const { showsCharacters, permissionGiverCharacters, earliestTakenOn } = LibraryLimits;
const isoDateLength = 10;

/** The photo or video as given, every value checked against its column, or the first reason it cannot be kept. */
export function checkLibraryItem(input: Input, today: string = new Date().toISOString().slice(0, isoDateLength)): LibraryItemGiven | string {
	const file = checkLibraryFile(input);
	if (typeof file === 'string') return file;
	const shows = textOf(input.shows);
	if (shows === '') return 'shows is empty: say what the photo or video shows';
	if (shows.length > showsCharacters) return `shows is ${shows.length} characters; keep it to ${showsCharacters}`;
	const takenOnProblem = problemWithTakenOn(input.takenOn, today);
	if (takenOnProblem !== null) return takenOnProblem;
	const posting = textOf(input.posting);
	if (!isPostingFooting(posting)) return `posting is one of ${postingFootings.join(', ')}`;
	const permission = checkPermissionGiver(posting, textOf(input.permissionGivenBy));
	if ('problem' in permission) return permission.problem;
	return { ...file, shows, takenOn: input.takenOn as string, posting, permissionGivenBy: permission.giver };
}

function textOf(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

function isPostingFooting(candidate: string): candidate is PostingFooting {
	return (postingFootings as string[]).includes(candidate);
}

function problemWithTakenOn(takenOn: unknown, today: string): string | null {
	const dateProblem = validateIsoDate('takenOn', takenOn);
	if (dateProblem !== null) return dateProblem.replace(/\.$/, '');
	const day = takenOn as string;
	if (day < earliestTakenOn) return `takenOn ${day} is before ${earliestTakenOn}`;
	if (day > today) return `takenOn ${day} is after today; give the day it was taken`;
	return null;
}

type PermissionCheck = { giver: string | null } | { problem: string };

function checkPermissionGiver(posting: PostingFooting, giver: string): PermissionCheck {
	const isPermissionGiven = posting === PostingFootings.permissionGiven;
	if (!isPermissionGiven && giver !== '') return { problem: 'permissionGivenBy is only given when posting is permission_given' };
	if (!isPermissionGiven) return { giver: null };
	if (giver === '') return { problem: 'permissionGivenBy is empty: name who gave permission for it to be posted' };
	if (giver.length > permissionGiverCharacters) {
		return { problem: `permissionGivenBy is ${giver.length} characters; keep it to ${permissionGiverCharacters}` };
	}
	return { giver };
}
