import type { SupabaseClient } from '@supabase/supabase-js';
import type { NotificationSubjectKind } from './notificationSubject';

const subjectColumns: Record<NotificationSubjectKind, string> = {
	task: 'task_id',
	goal: 'goal_id',
	room: 'chat_room_id'
};

/** Marks read every notification of the recipient's about one task, goal or room. */
export async function markSubjectNotificationsRead(
	supabase: SupabaseClient,
	recipientId: string,
	subjectKind: NotificationSubjectKind,
	subjectId: string
): Promise<void> {
	const { error } = await supabase
		.from('notifications')
		.update({ is_read: true })
		.eq('recipient_id', recipientId)
		.eq(subjectColumns[subjectKind], subjectId)
		.eq('is_read', false);
	if (error) throw error;
}
