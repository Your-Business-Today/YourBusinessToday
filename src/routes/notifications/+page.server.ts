import { fail, redirect } from '@sveltejs/kit';
import { getNotificationList } from '$lib/server/notifications/getNotificationList';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { findNotificationFor } from '$lib/server/notifications/findNotificationFor';
import { markAllNotificationsRead } from '$lib/server/notifications/markAllNotificationsRead';
import { markNotificationRead } from '$lib/server/notifications/markNotificationRead';
import { requireUser } from '$lib/server/auth/requireUser';
import { trimmedText } from '$lib/data/trimmedText';
import { validateRecordId } from '$lib/data/isUuid';
import type { Actions, PageServerLoad } from './$types';

const refusedStatus = 400;
const notFoundStatus = 404;
const seeOtherStatus = 303;

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
		const user = await requireUser(locals);
		const formData = await request.formData();
		const notificationId = trimmedText(formData.get('notificationId'));
		const idRefusal = validateRecordId('notification', notificationId);
		if (idRefusal !== null) return fail(refusedStatus, { message: idRefusal });
		const notification = await findNotificationFor(locals.supabase, user.id, notificationId);
		if (notification === null) return fail(notFoundStatus, { message: 'No notification of yours has that id.' });
		await markNotificationRead(locals.supabase, notificationId);
		redirect(seeOtherStatus, notification.path);
	},
	markAllRead: async ({ locals }) => {
		const user = await requireUser(locals);
		await markAllNotificationsRead(locals.supabase, user.id);
		return {};
	}
};
