import type { ApprovalPost } from './awaitingApproval';
import type { PieceAsShown } from './monthApproval';
import type { PostPicturesPage } from '../projections/postPicturesPage';

/** A post waiting for approval as the plan page shows it, its picture viewed through a signed link. */
export type ApprovalPostRow = ApprovalPost & { pictures: PostPicturesPage };

/** The month's posts waiting for approval, and each of their pieces as read, for one approval of them all. */
export type MonthApprovalPage = { posts: ApprovalPostRow[]; pieces: PieceAsShown[] };
