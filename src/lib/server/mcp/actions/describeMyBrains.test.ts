import { describe, expect, it } from 'vitest';
import { describeMyBrains, noBrainToSearch } from './describeMyBrains';
import type { BrainPageFound, BrainSearched } from '$lib/data/myBrainsRules';

const page = (title: string): BrainPageFound => ({ pageId: `id-${title}`, title, partKind: 'process', kind: 'rule', excerpt: '' });

const brain = (name: string, titles: string[], purpose = ''): BrainSearched => ({
	name,
	purpose,
	readOnWith: `read_chatbot_page with chatbotId ${name}`,
	pagesFound: titles.map(page)
});

describe('a search across every brain', () => {
	it('puts the brains holding most pages first, with what each is for, and names those that hold nothing', () => {
		const answer = describeMyBrains('opening hours', [brain('Site team', ['Hours']), brain('Sales', ['Hours', 'Holidays'], 'Answers sales'), brain('Books', [])]);
		expect(answer).toContain('Brains you reach that hold something on "opening hours": 2 of 3');
		expect(answer.indexOf('## 1. Sales: 2 pages')).toBeLessThan(answer.indexOf('## 2. Site team: one page'));
		expect(answer).toContain('For: Answers sales');
		expect(answer).toContain('Nothing on it in: Books.');
		expect(answer).toContain('Read on with read_chatbot_page with chatbotId Sales.');
	});

	it('shows at most three pages of a brain', () => {
		const answer = describeMyBrains('rules', [brain('Site team', ['One', 'Two', 'Three', 'Four'])]);
		expect(answer).toContain('4 pages');
		expect(answer).not.toContain('**Four**');
	});

	it('says plainly when the person reaches no brain', () => {
		expect(describeMyBrains('rules', [])).toBe(noBrainToSearch);
	});
});
