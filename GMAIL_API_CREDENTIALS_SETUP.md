# Gmail API Credentials Setup Guide

## Quick Setup (10 minutes)

You're now using Gmail API for email delivery. Here's how to get the credentials:

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a Project"** → **"New Project"**
3. Enter name: `Brush and Bond`
4. Click **Create**
5. Wait for project to be created (1-2 minutes)

---

## Step 2: Enable Gmail API

1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for `Gmail API`
3. Click the Gmail API result
4. Click **Enable**
5. Wait for it to enable (30 seconds)

---

## Step 3: Create Service Account

1. In left sidebar, go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in:
   - Service account name: `brush-and-bond-email`
   - Service account ID: (auto-filled, that's fine)
   - Click **Create and Continue**
4. Skip the optional steps, click **Done**

---

## Step 4: Create and Download Key

1. Under "Service Accounts", click the account you just created
2. Go to the **Keys** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON**
5. Click **Create**
6. A JSON file will download automatically (typically named like `brush-and-bond-email-xxxxx.json`)

---

## Step 5: Move Credentials to Project

1. In your project folder, move the downloaded JSON file to the root:
   ```
   brushandbond/gmail-credentials.json
   ```

2. Update `.env` with the actual project ID:
   ```env
   GMAIL_CREDENTIALS_PATH=./gmail-credentials.json
   GMAIL_PROJECT_ID=your-actual-project-id
   ```
   
   Find your project ID in the JSON file (it's the `"project_id"` field) or in the Cloud Console URL.

---

## Step 6: Grant Gmail Permission to Service Account

1. Back in Google Cloud Console, go to your service account
2. Copy the email address (looks like: `brush-and-bond-email@your-project.iam.gserviceaccount.com`)
3. Go to your personal Gmail (brushandbondgcect22@gmail.com)
4. Forward one test email to that service account email
5. In Gmail settings → Forwarding → Set up the forwarding (optional, but helps verify)

---

## Step 7: Test the Setup

```bash
cd backend
npm run api
```

Then:
1. Submit an application through the form
2. Approve it in the admin dashboard
3. Check the console for success message
4. Check the recipient email for the congratulations message

---

## Troubleshooting

**Error: "GMAIL_CREDENTIALS_PATH not set"**
- Make sure `.env` has: `GMAIL_CREDENTIALS_PATH=./gmail-credentials.json`

**Error: "Gmail credentials file not found"**
- Make sure `gmail-credentials.json` is in the workspace root (brushandbond folder)
- Check file path in `.env`

**Error: "Permission denied"**
- Verify service account has Gmail API access
- Make sure Gmail API is enabled in Cloud Console

**Error: "Invalid credentials"**
- Verify JSON file is valid (open it and check formatting)
- Make sure you're using the right JSON file (not the wrong one)

---

## Done?

Once you have `gmail-credentials.json` in the project root:
1. Start the backend: `npm run api`
2. Test with an application approval
3. Email will be sent via Gmail API ✅

Need help? Let me know at which step you get stuck!
