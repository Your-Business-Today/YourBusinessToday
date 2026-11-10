export type ActionActor = 'brand' | 'audience';

export type BrandAction = { key: string; actor: ActionActor; label: string; description: string };
