import { describe, expect, it } from 'vitest';
import { assembleContractDocument } from './assembleContractDocument';
import { readClientDocumentBySlug } from './readClientDocumentBySlug';
import { readOptionalClause } from './readOptionalClause';
import { contractOptionalClauses, defaultClauseSlugs } from '$lib/data/contractOptionalClauses';

const timesFound = (text: string, part: string) => text.split(part).length - 1;

describe('a contract with the optional clauses a pack chose', () => {
	it('has a text for every optional clause, and one place for each in its template', () => {
		for (const clause of contractOptionalClauses) {
			expect(readOptionalClause(clause.slug)).toBeTruthy();
			expect(timesFound(readClientDocumentBySlug(clause.place.documentSlug) ?? '', clause.place.anchor)).toBe(1);
		}
	});

	it('is the template unchanged when no clause is chosen', () => {
		expect(assembleContractDocument('order-form', [])).toBe(readClientDocumentBySlug('order-form'));
		expect(assembleContractDocument('master-services-agreement', [])).toBe(readClientDocumentBySlug('master-services-agreement'));
	});

	it('numbers the chosen changes to the MSA in the Order Form, in place of its placeholder', () => {
		const orderForm = assembleContractDocument('order-form', [...defaultClauseSlugs, 'buy-out']) ?? '';
		expect(orderForm).toContain('## 9. Changes to the MSA for this order\n\n### 9.1 Ownership and licence\n\n**Ownership.** YBT owns');
		expect(orderForm).toContain('### 9.2 Buy-out\n\n**Buy-out.**');
		expect(orderForm).not.toContain('[None.]');
	});

	it('puts the earlier NDA clause straight after the entire agreement clause, and nowhere else', () => {
		const agreement = assembleContractDocument('master-services-agreement', ['earlier-nda', 'minimum-term']) ?? '';
		expect(agreement).toMatch(/16\.4 \*\*Entire agreement\.\*\*[^\n]*\n\n16\.4A \*\*Earlier confidentiality agreement\.\*\*/);
		expect(agreement).not.toContain('Minimum term');
	});

	it('answers nothing for a document there is not', () => {
		expect(assembleContractDocument('not-a-document', [])).toBeUndefined();
	});
});
