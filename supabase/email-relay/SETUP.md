# Gmail approval and rejection email setup

This relay sends mail from the personal Gmail account that owns the Apps Script. It does not need a college mail domain, a paid mail provider, or a Google Cloud OAuth client. The Supabase Edge Function sends decisions to this relay over HTTPS, and the relay stores an idempotency marker so a retried decision does not send a second email.

## 1. Create the Gmail relay

1. Sign in to the Gmail account you want to send from, then open [Google Apps Script](https://script.google.com/home/start) and create a new project named `Brush and Bond Mail Relay`.
2. Replace the contents of `Code.gs` with the contents of this repository's `supabase/email-relay/Code.gs`, then save.
3. In **Project Settings → Script Properties**, add:
   - `SENDER_EMAIL`: the same Gmail address you signed into. This relay checks that the script executes as this account.
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
| `CLUB_EMAIL` | The same Gmail account, used as the reply-to address |

Save the secrets. Keep the secret identical in the two places and private. When both Gmail secrets exist, the approval function uses Gmail. An existing Resend configuration remains as a fallback until Gmail is configured.

## 3. Deploy and verify

The `admin-application-status` Edge Function uses this relay for approval and rejection messages. The `public-submission` Edge Function also uses it to send membership application receipts. After saving the secrets, verify delivery by submitting an application with an inbox you control, then confirm the receipt arrives from the club Gmail. You can also approve or reject that application to verify status notifications. The relay remembers successful message keys and returns the prior success on retries. If using this code with a different Supabase project, deploy both Edge Functions after setting their secrets.

## Limits and operations

Google currently lists **100 email recipients per day for consumer Gmail accounts** through Apps Script; the quota is per account, resets 24 hours after the first request, and can change. This is enough for normal approval/rejection volume but can be exhausted if 100 decisions are sent in one day. The relay checks the remaining daily quota before sending and returns a failure without changing the application status if none remains. See [Google Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas).

The shared secret protects the publicly reachable Apps Script URL. Rotate it in Script Properties and Supabase secrets together if it is exposed. Do not use a Gmail password or app password in Supabase or source code.
