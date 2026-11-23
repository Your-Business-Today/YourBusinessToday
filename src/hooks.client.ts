import type { HandleClientError } from '@sveltejs/kit';
import { reloadOnceForStaleBuild } from '$lib/client/staleBuild';

export const handleError: HandleClientError = ({ error, message }) => {
	reloadOnceForStaleBuild(error);
	return { message };
};
