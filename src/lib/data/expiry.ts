export function hasExpired(expiresAt: string, now: Date = new Date()): boolean {
	return new Date(expiresAt).getTime() < now.getTime();
}
