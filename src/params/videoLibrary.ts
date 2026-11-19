import { videoLibraryAt } from '$lib/components/projects/videos/videoLibraryAddress';
import type { ParamMatcher } from '@sveltejs/kit';

/** A segment beneath a project's videos matches only when it names one of its libraries; anything else is not found. */
export const match: ParamMatcher = (param) => videoLibraryAt(param) !== null;
