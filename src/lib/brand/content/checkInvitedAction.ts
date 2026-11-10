import { audienceActions } from '../actions/audienceActions';
import type { Medium } from '../mediums/mediumDefinition';

const audienceActionKeys = audienceActions.map((action) => action.key);

/** Why the audience action cannot be invited on the medium, or null when it can or none is invited. */
export function problemWithInvitedAction(actionKey: string, medium: Medium): string | null {
	if (actionKey === '') return null;
	if (!audienceActionKeys.includes(actionKey)) {
		return `invitedAction ${actionKey} is not something an audience does; it is one of ${audienceActionKeys.join(', ')}`;
	}
	if (!medium.actions.includes(actionKey)) return `${medium.label} does not let people ${actionKey}`;
	return null;
}
