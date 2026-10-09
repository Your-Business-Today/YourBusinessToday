import { fail, redirect } from '@sveltejs/kit';
import { getNotificationList } from '$lib/server/notifications/getNotificationList';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { markAllNotificationsRead } from '$lib/server/notifications/markAllNotificationsRead';
import { markNotificationRead } from '$lib/server/notifications/markNotificationRead';
import {
	conversationPath,
	type NotificationSubjectKind
} from '$lib/server/notifications/notificationListItem';
import { requireUser } from '$lib/server/auth/requireUser';
import type { Actions, PageServerLoad } from './$types';
import { notificationSubjectKinds } from '$lib/server/notifications/notificationListItem';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await requireUser(locals);
	const notifications = await getNotificationList(locals.supabase, user.id);
	const authorIds = notifications.flatMap((notification) =>
		notification.messageAuthorId === null ? [] : [notification.messageAuthorId]
	);
	return {
		notifications,
		authors: await getAccountsById(locals.supabase, authorIds)
	};
};

export const actions: Actions = {
	openNotification: async ({ locals, request }) => {
		await requireUser(locals);
		const formData = await request.formData();
		const notificationId = String(formData.get('notificationId') ?? '');
		const projectId = String(formData.get('projectId') ?? '');
		const subjectId = String(formData.get('subjectId') ?? '');
		const subjectKind = parseSubjectKind(formData.get('subjectKind'));
		if (notificationId === '' || projectId === '' || subjectId === '' || subjectKind === null) {
			return fail(400, { message: 'A notification is required.' });
		}
		await markNotificationRead(locals.supabase, notificationId);
		redirect(303, conversationPath(subjectKind, projectId, subjectId));
	},
	markAllRead: async ({ locals }) => {
		const user = await requireUser(locals);
		await markAllNotificationsRead(locals.supabase, user.id);
		return {};
	}
};

function parseSubjectKind(value: FormDataEntryValue | null): NotificationSubjectKind | null {
	if (value === notificationSubjectKinds.task || value === notificationSubjectKinds.goal) return value;
	return null;
}
