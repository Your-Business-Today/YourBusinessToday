-- 0232: a video piece of a brand's content names its music from the library.
--
-- A video made from a client's own footage carries a soundtrack from the same
-- library (music joined it in 0231), so a piece may name one item as its music:
--
--   brand_content_pieces.music_item_id   the library item that is the piece's
--                                        music, or null for none
--
-- The shots stay inside the piece's storyboard (JSON), each naming its own
-- clip, so this is the one column the change needs. The connector checks the
-- item is this brand's, is music, has arrived and may be posted before it is
-- written; the reference only keeps it from naming an item that is not there.
-- A library item named as music cannot be deleted, as nothing deletes one.
--
-- Additive and safe to re-run: nothing is dropped or rewritten.

begin;

alter table public.brand_content_pieces
	add column if not exists music_item_id uuid references public.brand_library_items (id) on delete restrict;

commit;

notify pgrst, 'reload schema';
