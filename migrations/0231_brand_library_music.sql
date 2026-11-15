-- 0231: a brand's library keeps its music beside its photos and videos.
--
-- A video made for a client needs its soundtrack to hand, so the library takes
-- MP3, M4A and WAV on the same footing rules and at the same 50 MB as a photo or
-- a video (src/lib/brand/library/libraryLimits.ts states the same types).
--
-- Only two things widen, and nothing is dropped that holds data:
--
--   brand_library_items.mime_type   its check takes audio/ as well as image/
--                                   and video/; every row it held still fits
--   the brand-library bucket        its allowed types add the five names a
--                                   browser gives MP3, M4A and WAV
--
-- The check is replaced under its own name, so running this twice leaves the
-- same check. Additive and safe to re-run.

begin;

alter table public.brand_library_items drop constraint if exists brand_library_items_mime_type_check;
alter table public.brand_library_items add constraint brand_library_items_mime_type_check
	check (mime_type ~ '^(image|video|audio)/[^/[:space:]]{1,127}$');

update storage.buckets
set allowed_mime_types = array['image/*', 'video/*', 'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav']
where id = 'brand-library';

commit;

notify pgrst, 'reload schema';
