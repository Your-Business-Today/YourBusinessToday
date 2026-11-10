import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { RememberedPicks } from '$lib/server/frame/rememberedPicks';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			resolvedUser?: User | null;
			portalOrganisationId: string | null;
			rememberedPicks: RememberedPicks;
		}
		interface PageState {
			taskSheet?: { projectId: string; taskId: string };
			isFrameDrawerOpen?: boolean;
		}
	}
}

export {};
