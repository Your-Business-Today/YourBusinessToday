import { contextPartKind } from './companyContext';
import { partKeysLinkedTo } from './contextLinks';
import type { CompanyContextVersion, ContextPart } from './companyContext';

/** A part the services are built around, with the names of the parts of the map it serves. */
export type ServedPart = { part: ContextPart; servesNames: string[] };

/** What a confirmed context suggests building, in the offer's order: the harness's sources, then one process at a time. */
export type ServiceOutline = { sourcesToTake: ServedPart[]; processes: ServedPart[] };

/**
 * The sources in the order the harness should take them, the core first and then those that create the most
 * records, and the processes the core first, each with the parts it serves.
 */
export function outlineServices(context: CompanyContextVersion): ServiceOutline {
	const served = (part: ContextPart) => ({ part, servesNames: namesLinkedTo(context, part.key) });
	const sources = partsOfKind(context, contextPartKind.source);
	const sourcesToTake = sources.sort((first, second) => takingOrder(context, first, second)).map(served);
	const processes = partsOfKind(context, contextPartKind.process).sort(coreFirst).map(served);
	return { sourcesToTake, processes };
}

function partsOfKind(context: CompanyContextVersion, kind: ContextPart['kind']): ContextPart[] {
	return context.parts.filter((part) => part.kind === kind);
}

function takingOrder(context: CompanyContextVersion, first: ContextPart, second: ContextPart): number {
	const byRecordsCreated = createdRecordCount(context, second) - createdRecordCount(context, first);
	return coreFirst(first, second) || byRecordsCreated;
}

function coreFirst(first: ContextPart, second: ContextPart): number {
	return Number(second.isCore) - Number(first.isCore);
}

function createdRecordCount({ links }: CompanyContextVersion, source: ContextPart): number {
	return links.filter((link) => link.fromKey === source.key && link.kind === 'creates').length;
}

function namesLinkedTo(context: CompanyContextVersion, partKey: string): string[] {
	const linkedKeys = partKeysLinkedTo(context, partKey);
	return context.parts.filter((part) => linkedKeys.has(part.key)).map((part) => part.name);
}
