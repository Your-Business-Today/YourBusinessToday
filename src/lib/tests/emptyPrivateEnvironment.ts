/**
 * What `$env/dynamic/private` answers under the tests: no secrets at all, so nothing reaches a real service, and email,
 * for one, reports itself not set up. A test that needs a value mocks the module with its own.
 */
export const env: Record<string, string | undefined> = {};
