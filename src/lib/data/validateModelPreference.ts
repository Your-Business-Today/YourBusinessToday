import { isLadderModel } from './modelLadder';

export const modelPreferenceRefusal = 'Pick a model from the slider.';

/** Why the model cannot be saved as the person's choice — it is not one the slider offers — or null when it can. */
export function validateModelPreference(modelId: string): string | null {
	if (isLadderModel(modelId)) return null;
	return modelPreferenceRefusal;
}
