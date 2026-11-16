import { describe, expect, it, vi } from 'vitest';

const env: Record<string, string | undefined> = {};
vi.mock('$env/dynamic/private', () => ({ env }));

const { beehiivPublication, beehiivSubscriptionRequest } = await import('./beehiivSubscription');

const publication = { apiKey: 'test-key', publicationId: 'pub_123' };

describe('beehiivPublication', () => {
	it('is null while the key is not set', () => {
		env.BEEHIIV_API_KEY = '';
		env.BEEHIIV_PUBLICATION_ID = 'pub_123';
		expect(beehiivPublication()).toBeNull();
	});

	it('names the publication once both settings are set', () => {
		env.BEEHIIV_API_KEY = 'test-key';
		env.BEEHIIV_PUBLICATION_ID = 'pub_123';
		expect(beehiivPublication()).toEqual(publication);
	});
});

describe('beehiivSubscriptionRequest', () => {
	it('subscribes the address to the publication with the welcome email', async () => {
		const request = beehiivSubscriptionRequest(publication, 'reader@example.com');
		const body = await request.json();
		expect(request.url).toBe('https://api.beehiiv.com/v2/publications/pub_123/subscriptions');
		expect(request.headers.get('authorization')).toBe('Bearer test-key');
		expect(body).toMatchObject({
			email: 'reader@example.com',
			send_welcome_email: true
		});
	});
});
