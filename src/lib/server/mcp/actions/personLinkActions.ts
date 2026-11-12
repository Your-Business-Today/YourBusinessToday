import { addPersonLink } from '$lib/server/people/addPersonLink';
import { addPersonNote } from '$lib/server/people/addPersonNote';
import { getPerson } from '$lib/server/people/getPerson';
import { noSuchPerson } from './describePerson';
import { objectSchema, proseField, readText, textField } from '../actionTypes';
import { personIdField } from './personFieldSchema';
import { personNoteKinds, personNoteTitles } from '$lib/data/personNoteKind';
import { personNoteLimits, validateNoteBody } from '$lib/data/personNoteRules';
import { personResearchLimits } from '$lib/data/personResearchRules';
import { removePersonLink } from '$lib/server/people/removePersonLink';
import { validatePersonLink } from '$lib/data/personLinkRules';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const noSuchLink = "No link with that id is on this person's record. read_person lists their links, each with its id.";
const linkField = {
	label: textField(`A short label such as "Company site", at most ${personResearchLimits.longestLinkLabel} characters`),
	url: textField('The page it opens, a full web address starting https://')
};

export const personLinkActions: McpAction[] = [
	{
		name: 'add_person_link',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: "keep a web page on a person's record, with a short label",
		inputSchema: objectSchema({ personId: personIdField, ...linkField }, ['personId', 'label', 'url']),
		run: async (caller, input) => keepLink(caller, input)
	},
	{
		name: 'remove_person_link',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: "take a link off a person's record",
		inputSchema: objectSchema({ personId: personIdField, linkId: textField('The link id, as read_person gives it') }, ['personId', 'linkId']),
		run: async (caller, input) => dropLink(caller, input)
	},
	{
		name: 'add_person_note',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: "add a note to a person's record, under your name",
		guidance:
			`A note is what a staff member learned or did — a call, a meeting, a thing to remember — in their own words, at most ${personNoteLimits.longestBody} characters. ` +
			`Research goes through save_person_research and a drafted approach through save_person_approach, which file their own kinds of note.`,
		inputSchema: objectSchema({ personId: personIdField, body: proseField('The note, in plain words') }, ['personId', 'body']),
		run: async (caller, input) => keepNote(caller, input)
	}
];

async function keepLink(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const personId = readText(input, 'personId');
	const idRefusal = validateRecordId('personId', personId);
	if (idRefusal !== null) return idRefusal;
	const link = validatePersonLink(input);
	if (typeof link === 'string') return link;
	const person = await getPerson(caller.supabase, personId);
	if (person === null) return noSuchPerson;
	const isAlreadyKept = person.links.some((kept) => kept.url === link.url);
	if (isAlreadyKept) return `${link.url} is already on ${person.name}'s record.`;
	await addPersonLink(caller.supabase, person.id, link);
	return `${link.label} is kept on ${person.name}'s record.`;
}

async function dropLink(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const personId = readText(input, 'personId');
	const linkId = readText(input, 'linkId');
	const idRefusal = validateRecordId('personId', personId) ?? validateRecordId('linkId', linkId);
	if (idRefusal !== null) return idRefusal;
	const person = await getPerson(caller.supabase, personId);
	if (person === null) return noSuchPerson;
	const link = person.links.find((kept) => kept.id === linkId);
	if (link === undefined) return noSuchLink;
	await removePersonLink(caller.supabase, link.id);
	return `${link.label} is off ${person.name}'s record.`;
}

async function keepNote(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const personId = readText(input, 'personId');
	const idRefusal = validateRecordId('personId', personId);
	if (idRefusal !== null) return idRefusal;
	const note = validateNoteBody(input.body);
	if (typeof note === 'string') return note;
	const person = await getPerson(caller.supabase, personId);
	if (person === null) return noSuchPerson;
	await addPersonNote(caller.supabase, person.id, personNoteKinds.note, note.body, caller.accountId);
	return `The ${personNoteTitles.note.toLowerCase()} is on ${person.name}'s record under your name.`;
}
