# Gmail approval and rejection email setup

This relay sends mail from the personal Gmail account that owns the Apps Script. It does not need a college mail domain, a paid mail provider, or a Google Cloud OAuth client. The Supabase Edge Function sends decisions to this relay over HTTPS, and the relay stores an idempotency marker so a retried decision does not send a second email.

## 1. Create the Gmail relay

1. Sign in to the Gmail account you want to send from, then open [Google Apps Script](https://script.google.com/home/start) and create a new project named `Brush and Bond Mail Relay`.
2. Replace the contents of `Code.gs` with the contents of this repository's `supabase/email-relay/Code.gs`, then save.
3. In **Project Settings → Script Properties**, add:
   - `SENDER_EMAIL`: `brushandbondgcect22@gmail.com`. This relay checks that the script executes as this account.
   - `RELAY_SECRET`: a private random value at least 32 bytes long. Generate one locally with Node.js: `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Do not put this value in source control, a browser app, or a chat.
4. In the Apps Script editor, select `authorizeMail` and click **Run** once. Review and grant the requested mail-sending permission while signed into the intended Gmail account.
5. Click **Deploy → New deployment → Web app**. Set **Execute as** to your account and **Who has access** to **Anyone**, then deploy and copy the URL ending in `/exec`. Google may ask you to confirm public access. Anyone can reach the endpoint, but requests without the secret are rejected.
6. If you edit the script later, use **Deploy → Manage deployments → Edit → New version → Deploy** so the live URL serves the update.

## 2. Add Supabase Edge Function secrets

Open the Supabase Dashboard for project `brushandbond` → **Edge Functions → Secrets** and add these values:

| Name | Value |
| --- | --- |
| `GMAIL_AUTOMATION_URL` | The Apps Script Web App URL ending in `/exec` |
| `GMAIL_AUTOMATION_SECRET` | The exact `RELAY_SECRET` value from Script Properties |
Save the secrets. Keep the secret identical in the two places and private. The approval function only changes an application to approved after Gmail accepts the message.

## 3. Deploy and verify

The `admin-application-status` Edge Function uses this relay for approval and rejection messages. After saving the secrets, approve a test application addressed to an inbox you control and confirm the message arrives from `brushandbondgcect22@gmail.com`. The relay remembers successful message keys and returns the prior success on retries. If using this code with a different Supabase project, deploy this Edge Function after setting its secrets.

## Limits and operations

Google currently lists **100 email recipients per day for consumer Gmail accounts** through Apps Script; the quota is per account, resets 24 hours after the first request, and can change. This is enough for normal approval/rejection volume but can be exhausted if 100 decisions are sent in one day. The relay checks the remaining daily quota before sending and returns a failure without changing the application status if none remains. See [Google Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas).

The shared secret protects the publicly reachable Apps Script URL. Rotate it in Script Properties and Supabase secrets together if it is exposed. Do not use a Gmail password or app password in Supabase or source code.

## Member broadcasts from Gmail

The same relay project also scans the official account's Sent folder and sends approved, opted-in members event and club updates. It does not forward ordinary mail. A message is a broadcast only when its subject begins with one of these exact prefixes:

- `[B&B EVENT]`
- `[B&B ANNOUNCEMENT]`
- `[B&B ACHIEVEMENT]`
- `[B&B UPDATE]`

After the database migration and Edge Functions are deployed:

1. In the existing Apps Script project, replace `Code.gs` with the current repository version. Keep the existing `SENDER_EMAIL` and `RELAY_SECRET` Script Properties.
2. Add Script Properties:
   - `BROADCAST_FUNCTION_URL`: `https://<project-ref>.supabase.co/functions/v1/member-email-broadcast`
   - `SUPABASE_PUBLISHABLE_KEY`: the project's publishable key (or legacy anon key)
3. In Supabase Dashboard → **Edge Functions → Secrets**, set `GMAIL_AUTOMATION_URL` to this Apps Script Web App URL and `GMAIL_AUTOMATION_SECRET` to the exact same private value as the Apps Script `RELAY_SECRET` property. A deployment health check currently confirms the broadcast function is deployed, but it returns `Gmail automation is not configured.` until this secret is set.
4. Run `authorizeMemberEmailAutomation` and approve Gmail read, mail send, and URL Fetch scopes while signed into `brushandbondgcect22@gmail.com`.
5. Run `installMemberEmailAutomation` once. It installs a five-minute trigger that scans matching sent messages and drains queued deliveries.
6. In **Deploy → Manage deployments → Edit → New version → Deploy**, publish the updated Web App code so Edge Functions can still call `doPost` for each private recipient delivery.
7. When composing an update, start the subject with one prefix above and send it as a new email (not as a reply inside an earlier broadcast thread). The body is sent to each approved member who checked the optional email-updates box. Their addresses are never included in a shared To/CC list.

The member list only includes approved applications with `email_updates_opt_in = true`. The checkbox is optional and unchecked by default. Existing approved members remain opted out until they explicitly opt in; the email footer provides an unsubscribe link. Delivery attempts and per-recipient status are stored in the private `member_email_campaigns` and `member_email_deliveries` tables. Gmail message IDs and per-recipient idempotency keys prevent duplicate sends when a trigger or network request retries.
