-- 0186: a piece of a brand's content carries the kind of post it is.
--
-- Each brand keeps its own kinds of post in its kit (the voice.postKinds
-- decision), in its own words: a builder's "before and after", a dental
-- practice's "patient story". A planned piece is one of them, so the month's
-- plan can show the mix. The kinds are the brand's own, so no check lists
-- them here: the connector refuses a kind the brand does not keep, by name.
-- The length check is the one a kit's list entry already has (120 characters,
-- ValueLimits.listItemCharacters), since a kind is kept in the brand's spelling.
--
-- brand_content_pieces is new in the same deploy (0168, 0183) and holds no live
-- rows; the column is nullable, so every row already there keeps what it holds.
--
-- Additive and safe to re-run.

begin;

alter table public.brand_content_pieces
	add column if not exists kind text check (char_length(kind) <= 120);

commit;

notify pgrst, 'reload schema';
