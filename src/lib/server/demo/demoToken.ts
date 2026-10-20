import { randomBytes } from 'node:crypto';
import { DemoLimit } from '$lib/data/demo/demoLimits';

const tokenBytes = 12;

/** The secret a prospect holds in their link: nobody else can guess it, and nothing else names their copy. */
export function newDemoToken(): string {
	return randomBytes(tokenBytes).toString('hex');
}

export function isDemoToken(value: string): boolean {
	return DemoLimit.tokenPattern.test(value);
}
