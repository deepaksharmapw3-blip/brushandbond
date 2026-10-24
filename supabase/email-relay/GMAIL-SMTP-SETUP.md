# Gmail SMTP for membership decision emails

This option sends approval and rejection notifications directly from `brushandbondgcect22@gmail.com` through Gmail SMTP. It does not use Apps Script. The `admin-application-status` Edge Function prefers SMTP when both SMTP secrets are configured; the Apps Script relay remains available as a fallback.

## 1. Create a fresh Google App Password

The App Password previously shared in chat should be revoked. Do not reuse it.

1. Sign in to the club Gmail account and open [Google App Passwords](https://myaccount.google.com/apppasswords). Google requires 2-Step Verification; if the option is unavailable, use the Apps Script relay or a verified email provider instead.
2. Create a new App Password for this integration. Keep it private; do not paste it into chat or source files.

Google's [App Password guidance](https://support.google.com/accounts/answer/185833) explains eligibility and revocation.

## 2. Add Edge Function secrets

Open [Supabase Edge Function secrets](https://supabase.com/dashboard/project/fxxolsjhlqlatwlqdwsq/functions/secrets) and set:

| Name | Value |
| --- | --- |
| `GMAIL_SMTP_USER` | `brushandbondgcect22@gmail.com` |
| `GMAIL_SMTP_APP_PASSWORD` | The new App Password (spaces are ignored by the function) |

After adding both SMTP secrets, they take priority over the Apps Script relay secrets. Do not save the App Password in Git, the frontend, or chat.

## 3. Verify delivery

Retry approval on a pending test application addressed to an inbox you control. Confirm the notification arrives from `brushandbondgcect22@gmail.com` and appears in the club account's Sent folder. If the request times out, check Sent before retrying; SMTP does not provide the relay's idempotency guarantee.

Google documents SMTP at `smtp.gmail.com` on port 465 (implicit TLS) or 587 (STARTTLS) in its [Gmail SMTP guide](https://developers.google.com/workspace/gmail/imap/imap-smtp). This function uses port 465 with TLS.
