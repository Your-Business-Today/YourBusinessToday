import { PUBLIC_SUPABASE_URL } from '$env/static/public';

/** Where files are kept: the address a browser sends an upload straight to. */
export const storageOrigin = new URL(PUBLIC_SUPABASE_URL).origin;
