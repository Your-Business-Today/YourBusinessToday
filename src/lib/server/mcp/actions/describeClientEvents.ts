import { clientEventLabels } from '$lib/data/clientEventLabels';
import { formatBritishDate } from '$lib/data/britishDate';
import type { ClientEvent } from '$lib/server/clients/clientEventRecord';

export function describeClientEvents(events: ClientEvent[]): string {
	if (events.length === 0) return 'Nothing has been recorded against this client yet.';
	return events.map(describeEventLine).join('\n');
}

function describeEventLine(event: ClientEvent): string {
	const when = formatBritishDate(event.createdAt);
	return `${when} — ${clientEventLabels[event.kind]}${describeEventDetail(event.detail)}`;
}

function describeEventDetail(detail: Record<string, unknown>): string {
	const words = Object.values(detail).filter((value) => typeof value === 'string');
	if (words.length === 0) return '';
	return `: ${words.join(', ')}`;
}
