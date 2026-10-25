import { describe, expect, it } from 'vitest';
import {
	deploysBetweenRefactorsFrom,
	deploysBetweenRefactorsRefusal,
	mostDeploysBetweenRefactors,
	projectNeedsName,
	wrongDatabaseKind,
	wrongStatus,
	type ProjectDetailsClaim
} from './projectDetailsRules';
import { longestDatabaseDetail } from './projectDatabase';
import { deployTimeRefusal } from './deployTime';
import { projectDetailsEditOf, validateProjectDetails } from './validateProjectDetails';

const claim: ProjectDetailsClaim = {
	name: 'Your Business Today',
	description: '',
	status: 'building',
	repositoryUrl: 'https://github.com/example/ybt',
	environmentUrl: '',
	defaultBranch: 'main',
	refactorEveryDeploys: 10,
	deployStagingAt: '',
	database: { kind: 'supabase', server: '', name: '', user: '', migrationsPath: 'migrations' }
};

describe('validateProjectDetails', () => {
	const held = { ...claim, deployStagingAt: null };

	it('lets through details every projects column can hold', () => {
		expect(validateProjectDetails(claim)).toEqual(held);
		expect(validateProjectDetails({ ...claim, refactorEveryDeploys: 0 })).toEqual({ ...held, refactorEveryDeploys: 0 });
		const atMost = { ...claim, refactorEveryDeploys: mostDeploysBetweenRefactors };
		expect(validateProjectDetails(atMost)).toEqual({ ...held, refactorEveryDeploys: mostDeploysBetweenRefactors });
	});

	it('holds a deploy time as hours and minutes, blank as no window, and refuses anything else', () => {
		expect(validateProjectDetails({ ...claim, deployStagingAt: '18:00' })).toEqual({ ...held, deployStagingAt: '18:00' });
		for (const deployStagingAt of ['6pm', '24:00', '18:00:00']) {
			expect(validateProjectDetails({ ...claim, deployStagingAt })).toBe(deployTimeRefusal);
		}
	});

	it('refuses a status or database kind the check constraints do not list', () => {
		expect(validateProjectDetails({ ...claim, status: 'active' })).toBe(wrongStatus);
		expect(validateProjectDetails({ ...claim, database: { ...claim.database, kind: 'mysql' } })).toBe(wrongDatabaseKind);
	});

	it('refuses a cadence the integer column cannot hold, never rounding it', () => {
		for (const refactorEveryDeploys of [-1, 2.5, Number.NaN, mostDeploysBetweenRefactors + 1]) {
			expect(validateProjectDetails({ ...claim, refactorEveryDeploys })).toBe(deploysBetweenRefactorsRefusal);
		}
	});

	it('keeps the existing name and database checks', () => {
		expect(validateProjectDetails({ ...claim, name: '' })).toBe(projectNeedsName);
		const longServer = 'x'.repeat(longestDatabaseDetail + 1);
		const database = { ...claim.database, server: longServer };
		expect(validateProjectDetails({ ...claim, database })).toContain(String(longestDatabaseDetail));
	});

	it('answers as an edit: the update, or the refusal', () => {
		expect(projectDetailsEditOf(claim)).toEqual({ update: held });
		expect(projectDetailsEditOf({ ...claim, status: 'active' })).toEqual({ refusal: wrongStatus });
	});
});

describe('deploysBetweenRefactorsFrom', () => {
	it('reads the number as written, and anything else as not a number', () => {
		expect(deploysBetweenRefactorsFrom(12)).toBe(12);
		expect(deploysBetweenRefactorsFrom(' 7 ')).toBe(7);
		expect(deploysBetweenRefactorsFrom('2.5')).toBe(2.5);
		expect(deploysBetweenRefactorsFrom('ten')).toBeNaN();
		expect(deploysBetweenRefactorsFrom(true)).toBeNaN();
		expect(deploysBetweenRefactorsFrom('')).toBeNaN();
	});
});
