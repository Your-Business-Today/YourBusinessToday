-- 0249: the premises a client was made from, found by the client.
--
-- A lead made from a premises now shows where it trades and on what phone
-- number: read_client and the company page ask premises for the rows tied to
-- the client (getPremisesForClient). Nothing found a premises by its client
-- before, so the column carries no index, and the table holds every food
-- business and every trading place of every territory: some ten thousand
-- places around Surbiton alone. Without an index every company page and every
-- read_client would read the whole table to find one row, or none.
--
-- The index holds only the premises that are tied to a client, a handful
-- beside the table, so the nightly loads write to it only for those.
--
-- Read on a scratch database holding thirty thousand invented premises, two
-- of them tied: before this the reader's query was a sequential scan, and
-- after it an index scan on premises_by_client, for the service role, for a
-- signed-in project manager under row security, for a client made from no
-- premises, and for a statement prepared with the client as a parameter.
--
-- Adds one index; no table, column or row is touched. Safe to re-run.

begin;

create index if not exists premises_by_client on public.premises (client_id) where client_id is not null;

commit;
