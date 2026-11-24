import * as answers from './brandKitWriteAnswers';
import { checkCustomTrait, type CustomTraitDraft } from '$lib/brand/decisions/checkCustomTrait';
import { findBrandSummary, keepBrandSummary } from '$lib/server/brandKits/keepBrandSummary';
import { brandHolderOfInput } from './brandHolderOfInput';
import { keepBrandTrait } from '$lib/server/brandKits/keepBrandTrait';
import { readText } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

const choicesNotAList = 'choices is a list of words';

/** Says what the organisation's or the product's brand is; one with no brand gets one. */
export async function describeBrand(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation) {
	const summary = readText(input, 'summary');
	const refusal = answers.validateBrandSummary(summary);
	if (refusal !== null) return refusal;
	const holder = await brandHolderOfInput(caller, input, organisation);
	if ('refusal' in holder) return holder.refusal;
	const given = { owner: holder.owner, summary, accountId: caller.accountId };
	const kept = await keepBrandSummary(caller.supabase, given);
	if (kept.isNew) return answers.brandStarted(holder, summary);
	return answers.brandRedescribed(holder, summary, kept.earlierSummary);
}

/** Adds a trait of the brand's own to its catalogue, checked before it is kept. */
export async function defineBrandTrait(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation) {
	const holder = await brandHolderOfInput(caller, input, organisation);
	if ('refusal' in holder) return holder.refusal;
	const summary = await findBrandSummary(caller.supabase, holder.owner);
	if (summary === null) return answers.noBrandYet(holder);
	const draft = traitDraftOf(input);
	if (draft === null) return answers.traitRefused(choicesNotAList);
	const check = checkCustomTrait(draft);
	if ('problem' in check) return answers.traitRefused(check.problem);
	const { trait } = check;
	const isKept = await keepBrandTrait(caller.supabase, holder.owner, trait);
	if (!isKept) return answers.traitAlreadyDefined(holder, trait.key);
	return answers.traitDefined(holder, trait);
}

function traitDraftOf(input: Record<string, unknown>): CustomTraitDraft | null {
	const choices = choicesOf(input.choices);
	if (choices === null) return null;
	const [facet, name, kind, label, purpose] = ['facet', 'name', 'kind', 'label', 'purpose'].map((field) =>
		readText(input, field)
	);
	return { facet, name, kind, label, purpose, choices };
}

function choicesOf(given: unknown): string[] | null {
	if (given === undefined) return [];
	if (!Array.isArray(given)) return null;
	const isEveryChoiceWords = given.every((choice) => typeof choice === 'string');
	if (!isEveryChoiceWords) return null;
	return given.map((choice: string) => choice.trim());
}
