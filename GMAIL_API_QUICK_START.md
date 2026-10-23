# Gmail API Quick Start

## Setup Overview

Gmail API allows full email management with OAuth (no passwords needed).

---

## Quick 5-Step Setup

### 1. Create Google Cloud Project
- Go to: https://console.cloud.google.com/
- Create new project: `Brush and Bond Email`
- Enable Gmail API

### 2. Create Service Account
- Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
- Create service account: `brush-and-bond-email`
- Add role: `Editor`

### 3. Create JSON Key
- In service account, click "KEYS"
- "Create new key" → "JSON"
- Download and save as `gmail-credentials.json` in project root

### 4. Install Dependencies
```bash
cd backend
npm install googleapis
```

### 5. Update .env
```env
GMAIL_API_ENABLED=true
GMAIL_CREDENTIALS_PATH=./gmail-credentials.json
GMAIL_SERVICE_EMAIL=brush-and-bond-email@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

Replace `YOUR_PROJECT_ID` with your actual Google Cloud project ID.

---

## Update Application Controller

In `backend/src/controllers/application.controller.js`, change:
```javascript
const emailService = require("../services/emailServiceGmailAPI");
```

---

## Test It

```bash
npm run api
```

Then:
1. Submit application
2. Approve in admin
3. Email sent via Gmail API! ✅

---

## Benefits

✅ Full Gmail control
✅ Read/manage emails
✅ More reliable
✅ No SMTP passwords
✅ OAuth instead of credentials

---

## Important Files

- `backend/src/services/emailServiceGmailAPI.js` - Gmail API service
- `gmail-credentials.json` - Service account credentials (NOT in Git)
- `.env` - Configuration

---

## When You're Ready

1. Get your Google Cloud project ID from dashboard
2. Update .env with your project ID
3. Place credentials file
4. Run backend
5. Test!

---

**Note**: This is more complex than Resend but gives you full Gmail control!

See `GMAIL_API_SETUP.md` for detailed step-by-step instructions.
