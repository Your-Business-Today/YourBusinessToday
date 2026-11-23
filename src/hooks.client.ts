import { isFromAnEarlierDeploy, reloadOnceForFreshCode } from '$lib/client/staleDeployment';
import type { HandleClientError } from '@sveltejs/kit';

const loadingFreshCopyMessage = 'Loading the latest version of this page';

export const handleError: HandleClientError = ({ error, message }) => {
	const isStalePage = isFromAnEarlierDeploy(error);
	if (isStalePage && reloadOnceForFreshCode()) return { message: loadingFreshCopyMessage };
	return { message };
};
