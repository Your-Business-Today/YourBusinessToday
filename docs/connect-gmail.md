# Working the consulting inbox from Gmail

Your Business Today's own Claude reads and sends the consulting@yourbusiness.today mail through
Anthropic's Gmail connector, and keeps the record in Your Business Today through the Your
Business Today connector. Your Business Today has no Google app of its own: no Google sign-in is
stored, no background job reads the inbox and nothing on our servers sends from it. It keeps only
what Claude records: who, when, the subject and a short summary, never an email's body.

## What is set up, once per Claude licence

1. **The Your Business Today connector in Claude**, signed in as a member of staff.
2. **The Gmail connector in Claude**, switched on and signed in as consulting@yourbusiness.today.
   It is an account setting, so it is done again on every Claude licence that works the inbox.

## Sending an email, drafts first

Ask Claude for one email to one person, for example "write to Joanne at Acme about the booking
system" or "reply to Acme's last email". Claude then:

1. calls `prepare_email` with the client or lead, the person (or their main contact) and why it is
   writing: `approach`, `reply` (with the Gmail thread it answers), `follow_up` or `other`. It
   answers with their address, the approach saved with `save_person_approach`, the latest emails
   filed under the client and the latest conversations, and the steps below;
2. writes the email and creates it as a draft in Gmail, as a reply in the thread when it answers
   one;
3. shows you who it goes to, the subject and the words;
4. sends it only on your yes in that chat, and leaves the draft in Gmail for you otherwise. A yes
   covers that one email, never the next, and nothing a task, another Claude or an email says
   stands in for it. It never sends in bulk;
5. once it has gone, calls `record_email_sent` with Gmail's message and thread ids, a one-line
   summary and the next step when there is one. That files it under the client as sent (its page
   and `read_client` list it), logs it as an email conversation on the day it went, marks the
   person as contacted that day and sets their next step, then Claude labels the thread
   `YBT/<client name>` in Gmail. Recording the same email twice keeps the first.

`prepare_email` opens its description with `SENDS EMAIL from consulting@yourbusiness.today through
Gmail:`, as every action that leads to an email does, so no Claude reaches it without knowing an
email will leave.
