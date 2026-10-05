# Email Setup Guide

Two systems send mail on the site's behalf, and both need one-time configuration
before anything reaches an inbox from `yourbusiness.today`:

- **The app's own transactional emails** — workspace invites, chatbot invites and client
  portal invites — go out through Resend from `src/lib/server/email/sendTransactionalEmail.ts`.
  Until `RESEND_API_KEY` and `EMAIL_FROM` are set, every invite is recorded but no email
  leaves, and the person inviting sees "Invite recorded but the email was not sent —
  email is not configured".
- **Supabase Auth emails** — sign-up confirmation, password reset, magic links — go out
  from Supabase's built-in mailer as `noreply@mail.app.supabase.io`, capped at two an hour,
  until Supabase is pointed at Resend's SMTP relay.

## 1. Resend — verify the sending domain

1. Sign in at [resend.com](https://resend.com) and open **Domains → Add domain**.
2. Enter `yourbusiness.today`, choose the EU region, and add the records Resend lists
   at the DNS provider for the domain. They are:

   | Record | Host | Purpose |
   | --- | --- | --- |
   | TXT | `resend._domainkey` | DKIM — signs every message as genuinely ours |
   | MX | `send` | Return path for bounces (points at Resend's Amazon SES relay) |
   | TXT | `send` | SPF for that return path (`v=spf1 include:amazonses.com ~all`) |
   | TXT | `_dmarc` | DMARC — required by Gmail and Yahoo: `v=DMARC1; p=none`, with no `rua=` tag (see *DMARC reporting* below) |

3. Click **Verify**. Propagation takes minutes to an hour; the domain shows **Verified**
   when all records resolve.
4. Open **API Keys → Create API key** with *Sending access* only, scoped to the domain,
   and copy it once — Resend never shows it again.

## 2. Set the environment variables

In `.env` locally and in the host's environment (Vercel → Project → Settings →
Environment Variables), for every environment that should send mail:

| Variable | Value | Read by |
| --- | --- | --- |
| `RESEND_API_KEY` | The key from step 1 (`re_…`) | `sendTransactionalEmail.ts` |
| `EMAIL_FROM` | `Your Business Today <hello@yourbusiness.today>` | `sendTransactionalEmail.ts` — the display name and address on every invite |
| `ENQUIRY_NOTIFICATION_EMAIL` | The inbox that should receive website enquiries | The contact-form notification, once it lands |

`EMAIL_FROM` must use the domain verified in step 1 — Resend rejects any other sender.
The live domain is `yourbusiness.today`; no other domain is ever used as a sender.

Redeploy after changing them. The app reads these through `$env/dynamic/private`, so a
running Vercel function picks them up on its next cold start, not before.

## Checking mail stays out of spam

Gmail, Yahoo and Outlook now file mail as spam, or refuse it, unless it passes SPF or
DKIM *aligned with the From domain* and the domain publishes a DMARC record. With the
records in step 1 in place Resend passes all three: DKIM signs as `yourbusiness.today`,
and SPF passes on `send.yourbusiness.today`, which aligns with it. The usual reasons mail
still lands in spam, most likely first:

1. **The domain is not verified in Resend**, or one record failed. Resend → Domains
   must show every record green, not just **Verified**.
2. **`EMAIL_FROM` is on another domain** (an old `yourbusinesstoday.uk` value, or a
   Gmail address). Check the value in Vercel, not in `.env.example`.
3. **No DMARC record.** `_dmarc` is required, not optional: publish
   `v=DMARC1; p=none` and leave it there.
4. **Auth emails still come from Supabase** (`noreply@mail.app.supabase.io`) — section 3.
5. **A new domain with no reputation.** Early mail is treated with suspicion; the fix
   is to keep sending low volumes of mail people open, and to ask the first recipients
   to mark it *Not spam*.

To test, send one of each email (a project invite, a password reset from the admin
page, a sign-up confirmation) to a Gmail and an Outlook address, then:

- **Gmail:** open the message → ⋮ → **Show original**. SPF, DKIM and DMARC must each
  read **PASS**, with DKIM `d=yourbusiness.today`.
- **Outlook:** open the message → ⋯ → **View** → **View message source**, and find
  `Authentication-Results`: `spf=pass`, `dkim=pass`, `dmarc=pass`.
- **Score:** send one to the address [mail-tester.com](https://www.mail-tester.com)
  gives you. 9/10 or better is the aim; it names anything that costs points.

Once every test passes from every sender the domain uses, tighten the record to
`p=quarantine`. The root domain sends mail from Google Workspace as well as Resend
(`consulting@yourbusiness.today` is a Gmail mailbox), so the root needs Google's SPF
`include:` and Google's DKIM record before tightening, or replies from that mailbox
are treated as fakes. Check a message from each sender with *Show original* as above.

### DMARC reporting

The DMARC record can carry a `rua=mailto:` tag asking every receiving provider to send
a daily aggregate report. Do not point it at a mailbox: Google sends one a day and
Microsoft one per region, each a zipped XML file listing sending IP addresses, written
for software rather than people. They were pointed at `consulting@yourbusiness.today`
until 5 October 2026, nobody read them, and the tag was removed. If the signal is ever
wanted (an unknown server sending as `yourbusiness.today`), point `rua=` at a free
digest service such as Postmark's DMARC tool, which turns the XML into one readable
weekly summary. The record itself stays; only the reporting tag is optional.

## 3. Supabase Auth through Resend's SMTP relay

Supabase's built-in mailer exists for development only: its sender is
`noreply@mail.app.supabase.io`, it is rate-limited to **2 emails an hour** across the
whole project, and it lands in spam. Pointing it at Resend fixes all three.

In the [Supabase dashboard](https://supabase.com/dashboard), select the project and open
**Authentication → Emails → SMTP Settings** (older dashboards: **Project Settings →
Authentication → SMTP Settings**). Toggle **Enable Custom SMTP** on and fill in:

| Field | Value |
| --- | --- |
| Sender email | `hello@yourbusiness.today` — the same address as `EMAIL_FROM` |
| Sender name | `Your Business Today` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | The Resend API key from step 1 |

Save, then open **Authentication → Rate Limits** and raise **Rate limit for sending
emails** — the 2-per-hour ceiling only lifts once custom SMTP is on; 30 an hour is a
sensible starting point.

Resend logs every message it relays under **Emails** in its dashboard, so a "confirmation
never arrived" report can be checked there first.

## 4. Rebrand the auth email templates

Supabase's default templates say "Confirm your signup" with no mention of who is
asking. Under **Authentication → Emails → Templates** edit each of these to name the
site and read like our own invites (dark card, `YBT.` wordmark, one red button — see
`src/lib/server/email/inviteEmail.ts` for the house style):

| Template | Subject to use |
| --- | --- |
| Confirm sign up | `Confirm your Your Business Today account` |
| Reset password | `Reset your Your Business Today password` |
| Magic link | `Your sign-in link for Your Business Today` |
| Invite user | `You've been invited to Your Business Today` — used for client portal invites |

Keep the `{{ .ConfirmationURL }}` placeholder in each body; everything else is ours to
write. Also set **Authentication → URL Configuration → Site URL** to
`https://yourbusiness.today` so the links in those emails come back to the live site
(`docs/google-login-setup.md` §4 covers the redirect allow-list).

## 5. Leaked password protection

Under **Authentication → Sign In / Providers → Email**, scroll to the password settings
and turn on **Prevent use of leaked passwords**. Supabase then checks every new password
against the HaveIBeenPwned range API and refuses ones that have appeared in a breach.
This needs the Pro plan; on the free plan the toggle is greyed out. The app's own rule
(`minimumPasswordLength` in `src/lib/server/auth/passwordRules.ts`) still applies either
way.

## 6. The `supabase.co` address that flashes during Google sign-in

During **Continue with Google** the browser briefly shows
`oortdjuletpansoztdpu.supabase.co`. That is not Stripe and not a leak: it is Supabase
Auth's own OAuth callback, `https://<project-ref>.supabase.co/auth/v1/callback`. Google
sends the signed-in user there, Supabase exchanges the code and mints the session, then
redirects to our `/auth/callback`. Every Supabase project works this way, and
`docs/google-login-setup.md` §1 is where that URL was copied into the Google client.

The only way to put our own name on that hop is Supabase's **Custom Domain** add-on
(a paid add-on on the project, currently billed monthly). It replaces the
`<project-ref>.supabase.co` hostname for the whole API, auth included. The steps:

1. At the DNS provider, add a CNAME `auth.yourbusiness.today` → `oortdjuletpansoztdpu.supabase.co`.
2. In the Supabase dashboard open **Project Settings → General → Custom Domains**
   (or run `supabase domains create --project-ref oortdjuletpansoztdpu --custom-hostname auth.yourbusiness.today`)
   and add the TXT verification records it asks for.
3. **Verify**, then **Activate**. Both hostnames keep working, so nothing breaks
   mid-switch.
4. In Google Cloud Console → Credentials → the OAuth client, change the authorised
   redirect URI to `https://auth.yourbusiness.today/auth/v1/callback` — Google
   rejects the old one once it stops matching what Supabase sends.
5. Set `PUBLIC_SUPABASE_URL=https://auth.yourbusiness.today` in every environment and
   redeploy, so the auth cookies and API calls use the same hostname.

Until that add-on is bought, the flash of `supabase.co` is expected and harmless.

Stripe is a separate matter and already stays on our domain: `createCheckoutSession`
(`src/lib/server/payments/createCheckoutSession.ts`) sends Stripe
`success_url: {origin}/account/credits?checkout=success` and
`cancel_url: {origin}/account/credits?checkout=cancelled`, where `origin` is the site the
request came from. The only third-party address a buyer sees is `checkout.stripe.com`
itself, which is Stripe's hosted page and cannot be rebranded.

## Checklist

| Done by hand in a dashboard | Where |
| --- | --- |
| Verify `yourbusiness.today` and create an API key | Resend |
| Publish the `_dmarc` record, with no `rua=` tag | DNS provider |
| Test in Gmail, Outlook and mail-tester — see *Checking mail stays out of spam* | Inboxes |
| Set `RESEND_API_KEY`, `EMAIL_FROM`, `ENQUIRY_NOTIFICATION_EMAIL` | Vercel environment variables |
| Enable custom SMTP through `smtp.resend.com:465` | Supabase → Authentication → Emails → SMTP Settings |
| Raise the email rate limit | Supabase → Authentication → Rate Limits |
| Rebrand confirm / reset / magic link / invite templates | Supabase → Authentication → Emails → Templates |
| Turn on leaked password protection (Pro plan) | Supabase → Authentication → Sign In / Providers → Email |
| Optional: custom auth domain, then update the Google redirect URI | Supabase add-on, Google Cloud Console |
