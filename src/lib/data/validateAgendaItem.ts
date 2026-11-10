import { agendaPurposes, type AgendaPurpose } from './boardroomMeeting';
import { agendaItemTitleRefusal, boardroomMeetingRefusals } from './boardroomMeetingRules';

/** An agenda item as a director writes it, before it has a place on a meeting. */
export type AgendaItemDraft = { title: string; purpose: AgendaPurpose };

export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function readAgendaPurpose(value: unknown): AgendaPurpose | null {
	return agendaPurposes.find((purpose) => purpose === value) ?? null;
}

export function validateAgendaTitle(value: unknown): string | { refusal: string } {
	const title = String(value ?? '').trim();
	const refusal = agendaItemTitleRefusal(title);
	if (refusal !== null) return { refusal };
	return title;
}

function validateAgendaItemDraft(value: unknown): AgendaItemDraft | string {
	if (!isRecord(value)) return boardroomMeetingRefusals.itemNotAnObject;
	const title = validateAgendaTitle(value.title);
	if (typeof title !== 'string') return title.refusal;
	const purpose = readAgendaPurpose(value.purpose);
	if (purpose === null) return boardroomMeetingRefusals.purposeUnknown;
	return { title, purpose };
}

/** Each item as given, checked against its columns, or the sentence naming the first that does not fit. */
export function validateAgendaItemDrafts(value: unknown): AgendaItemDraft[] | string {
	if (!Array.isArray(value)) return boardroomMeetingRefusals.agendaMissing;
	const drafts: AgendaItemDraft[] = [];
	for (const item of value) {
		const draft = validateAgendaItemDraft(item);
		if (typeof draft === 'string') return draft;
		drafts.push(draft);
	}
	return drafts;
}
