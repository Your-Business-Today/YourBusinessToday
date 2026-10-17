import type { SiteDoor } from '$lib/portal/siteDoors';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			resolvedUser?: User | null;
			door: SiteDoor;
			portalOrganisationId: string | null;
		}
	}
}

export {};
