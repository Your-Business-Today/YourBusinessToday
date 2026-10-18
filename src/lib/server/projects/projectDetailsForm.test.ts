import { describe, expect, it } from 'vitest';
import { parseProjectDetailsForm } from './projectDetailsForm';
import { deploysBetweenRefactorsRefusal, wrongStatus } from '$lib/data/projectDetailsRules';

function formWith(fields: Record<string, string>): FormData {
	const formData = new FormData();
	const filled = { name: 'Portal', status: 'building', databaseKind: 'none', ...fields };
	for (const [field, value] of Object.entries(filled)) formData.set(field, value);
	return formData;
}

describe('parseProjectDetailsForm', () => {
	it('reads a blank cadence and branch as their defaults', () => {
		const edit = parseProjectDetailsForm(formWith({ refactorEveryDeploys: '', defaultBranch: '' }));
		expect(edit).toMatchObject({ update: { refactorEveryDeploys: 10, defaultBranch: 'main' } });
	});

	it('refuses a cadence it would once have rounded or replaced', () => {
		for (const refactorEveryDeploys of ['2.5', '-3', 'often']) {
			expect(parseProjectDetailsForm(formWith({ refactorEveryDeploys }))).toEqual({ refusal: deploysBetweenRefactorsRefusal });
		}
	});

	it('refuses a status it would once have replaced with scoping', () => {
		expect(parseProjectDetailsForm(formWith({ status: 'active' }))).toEqual({ refusal: wrongStatus });
	});
});
