# Working the consulting Gmail inbox with Your Business Today

The owner's own Claude reads the consulting inbox (consulting@yourbusiness.today) through
Anthropic's Gmail connector, and keeps the record of what it decided through the Your Business
Today connector. Your Business Today has no Google app of its own: no Google sign-in is stored,
no Connect Gmail button, no sync and no background job. Claude reads only what the signed-in
mailbox can already see, and Your Business Today keeps only what Claude records: who an email was
from, when, its subject, a short summary and the ids that open it in Gmail, never the body.

## What to set up, once on each Claude licence

1. **The Your Business Today connector in Claude.** Add a custom connector with the address
   `https://www.yourbusiness.today/api/mcp`, press Connect and sign in as usual.
2. **The Gmail connector in Claude.** Turn on Anthropic's Gmail connector and sign in as
   consulting@yourbusiness.today. This is a setting of the Claude account, not of the
   repository, so it has to be switched on again on every Claude licence the inbox is worked
   from. On Claude Team or Enterprise an owner of the Claude organisation turns it on first.
3. **Check both.** Ask Claude "what are my five latest emails" and "/ybt-help"; both should answer.

## What to ask Claude

Type **/ybt-inbox** (or pick *YBT inbox: triage my inbox with Your Business Today* from the
prompt menu). Claude then:

- reads where the last run stopped with `read_inbox_triage`, searches Gmail for what is newer
  and not yet labelled `YBT/Triaged`, and skips every email already decided;
- takes the emails one at a time and asks `find_records_for_email` who each is from;
- files it under its client or lead with `file_email_to_client`, raises what it asks for (a lead,
  a task, a support request or a to-do), or sets it aside when it is spam, a newsletter, an
  automatic reply or a receipt;
- puts the labels `YBT/<client name>` and `YBT/Triaged` on it in Gmail, and archives it out of
  the inbox only when nothing is left to do on it;
- records each outcome with `record_triage_decision`, so the next run, on any licence, does not
  decide it again;
- asks you only about an email whose client or lead is not clear, one at a time, and ends with a
  short summary of what was filed and what needs you.

A client's or lead's page lists the emails filed under it, each with a link that opens the
thread in Gmail.

## What stays by hand

- Nothing is triaged until someone asks Claude to; there is no background run.
- Triage never sends or drafts a reply. Sending from the consulting address is its own step,
  drafts first, on your yes.
- If Claude has no Gmail tools, it says so and stops: switch the Gmail connector on for that
  licence and ask again.
