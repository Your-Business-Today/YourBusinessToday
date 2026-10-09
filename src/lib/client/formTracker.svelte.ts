import type { SubmitFunction } from '@sveltejs/kit';
import { actionResultTypes } from './actionResultTypes';

const fallbackErrorMessage = 'Something went wrong — please try again.';

/**
 * Per-form save state: exposes isSaving while a submission is in flight,
 * blocks double submits, and captures the server's fail() message (or a
 * fallback) into errorMessage for inline display.
 */
export class FormTracker {
	isSaving = $state(false);
	errorMessage = $state<string | null>(null);

	reset(): void {
		this.errorMessage = null;
	}

	/**
	 * Build the use:enhance submit function. onSuccess runs as soon as the save is
	 * confirmed; shouldKeepFields leaves what was typed in place after the response,
	 * for forms whose failure the user should be able to retry without retyping.
	 */
	submit(onSuccess?: () => void, options: { shouldKeepFields?: boolean } = {}): SubmitFunction {
		return ({ cancel }) => {
			if (this.isSaving) {
				cancel();
				return;
			}
			this.isSaving = true;
			this.errorMessage = null;
			return async ({ update, result }) => {
				try {
					const succeeded =
						result.type !== actionResultTypes.failure && result.type !== actionResultTypes.error;
					// On success run onSuccess (usually "close the modal") BEFORE update():
					// update() resets the form fields and then awaits a data refetch, so
					// running it first flashed a blanked-out form inside the still-open
					// modal before the modal finally closed.
					if (succeeded) onSuccess?.();
					await update({ reset: options.shouldKeepFields !== true });
					if (result.type === actionResultTypes.failure) {
						const failureData = result.data as { message?: unknown } | undefined;
						this.errorMessage =
							typeof failureData?.message === 'string' ? failureData.message : fallbackErrorMessage;
						return;
					}
					if (result.type === actionResultTypes.error) this.errorMessage = fallbackErrorMessage;
				} finally {
					this.isSaving = false;
				}
			};
		};
	}
}
