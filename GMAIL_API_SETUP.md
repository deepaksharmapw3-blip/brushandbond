# Gmail API Setup Guide

## Overview

Setting up Gmail API allows you to:
- ✅ Send emails programmatically
- ✅ Read and manage emails
- ✅ Search and filter emails
- ✅ Create drafts
- ✅ Full automation capabilities

---

## Step 1: Create Google Cloud Project

### 1.1 Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Name it: `Brush and Bond Email`
5. Click "CREATE"
6. Wait for project to be created (1-2 minutes)

### 1.2 Enable Gmail API
1. In the search bar, search: `Gmail API`
2. Click on "Gmail API"
3. Click "ENABLE"
4. Wait for it to enable

---

## Step 2: Create Service Account

### 2.1 Create Service Account
1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Click "CREATE SERVICE ACCOUNT"
3. Enter:
   - Service account name: `brush-and-bond-email`
   - Service account ID: `brush-and-bond-email`
   - Description: `Email service for Brush and Bond`
4. Click "CREATE AND CONTINUE"

### 2.2 Grant Permissions
1. Click "GRANT THIS SERVICE ACCOUNT ACCESS TO PROJECT"
2. Under "Role", select: `Editor` (or `Gmail Administrator`)
3. Click "CONTINUE"
4. Click "DONE"

---

## Step 3: Create and Download Credentials

### 3.1 Create JSON Key
1. Go back to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Find and click on `brush-and-bond-email`
3. Click "KEYS" tab
4. Click "ADD KEY" → "Create new key"
5. Choose "JSON"
6. Click "CREATE"
7. A file will download automatically (save it safely!)

### 3.2 Save Credentials File
1. Rename the downloaded file to: `gmail-credentials.json`
2. Save it in your project root (same folder as `.env`)
3. Add to `.gitignore`:
   ```
   gmail-credentials.json
   ```

---

## Step 4: Enable Domain-Wide Delegation

### 4.1 Configure OAuth Consent Screen
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Choose "External" (or "Internal" if available)
3. Click "CREATE"
4. Fill in:
   - App name: `Brush and Bond`
   - User support email: `brushandbondgcect22@gmail.com`
   - Developer contact: Your email
5. Click "SAVE AND CONTINUE"
6. Skip scopes (click "SAVE AND CONTINUE")
7. Add test users: `brushandbondgcect22@gmail.com`
8. Click "SAVE AND CONTINUE"

### 4.2 Enable Domain-Wide Delegation
1. Go back to Service Accounts: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Click on `brush-and-bond-email`
3. Click "DETAILS" tab
4. Under "Domain-wide delegation", click "ENABLE"
5. Agree and save

---

## Step 5: Update Environment Variables

Add to `.env`:
```env
GMAIL_API_ENABLED=true
GMAIL_CREDENTIALS_PATH=./gmail-credentials.json
GMAIL_SERVICE_EMAIL=brush-and-bond-email@YOUR_PROJECT_ID.iam.gserviceaccount.com
GMAIL_USER_EMAIL=brushandbondgcect22@gmail.com
```

Replace `YOUR_PROJECT_ID` with your actual Google Cloud project ID.

Find your project ID:
1. Go to: https://console.cloud.google.com/home/dashboard
2. Look for "Project ID" (it's in the info box)
3. Copy it and add to the env var above

---

## Step 6: Install Dependencies

```bash
cd backend
npm install googleapis nodemailer
```

---

## Step 7: Create Gmail API Email Service

Create `backend/src/services/emailServiceGmailAPI.js`:

```javascript
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class GmailAPIEmailService {
  constructor() {
    this.auth = null;
    this.gmail = null;
    this.initialized = false;
    this.initializeGmailAPI();
  }

  async initializeGmailAPI() {
    try {
      const credentialsPath = process.env.GMAIL_CREDENTIALS_PATH || './gmail-credentials.json';
      
      if (!fs.existsSync(credentialsPath)) {
        console.warn('⚠️  Gmail credentials file not found');
        return;
      }

      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      
      this.auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: ['https://www.googleapis.com/auth/gmail.send'],
      });

      this.gmail = google.gmail({ version: 'v1', auth: this.auth });
      this.initialized = true;
      console.log('✅ Gmail API service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Gmail API:', error.message);
    }
  }

  isAvailable() {
    return this.initialized && this.gmail !== null;
  }

  async sendApprovalEmail(memberData, clubInfo = {}) {
    if (!this.isAvailable()) {
      console.log('ℹ️  Gmail API service unavailable');
      return { success: false, reason: 'Gmail API not configured' };
    }

    try {
      const { fullName, email } = memberData;
      const clubDescription = clubInfo.description || 'We are a vibrant community...';
      const clubName = clubInfo.name || 'GCECT Art Club - Brush and Bond';
      const instagramUrl = clubInfo.instagramUrl || '#';
      const contactEmail = clubInfo.contactEmail || 'brushandbondgcect22@gmail.com';

      const htmlContent = this.generateApprovalEmailHTML(
        fullName, clubName, clubDescription, instagramUrl, contactEmail
      );

      const message = this.createEmailMessage(
        contactEmail,
        email,
        '🎨 Welcome to Brush and Bond! Your Application is Approved',
        htmlContent
      );

      const result = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: message,
        },
      });

      console.log(`✅ Approval email sent to ${email}`);
      return { success: true, messageId: result.data.id };
    } catch (error) {
      console.error(`❌ Failed to send approval email: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async sendRejectionEmail(memberData, adminNotes = '', clubInfo = {}) {
    if (!this.isAvailable()) {
      console.log('ℹ️  Gmail API service unavailable');
      return { success: false, reason: 'Gmail API not configured' };
    }

    try {
      const { fullName, email } = memberData;
      const clubName = clubInfo.name || 'GCECT Art Club - Brush and Bond';
      const contactEmail = clubInfo.contactEmail || 'brushandbondgcect22@gmail.com';

      const htmlContent = this.generateRejectionEmailHTML(
        fullName, clubName, adminNotes, contactEmail
      );

      const message = this.createEmailMessage(
        contactEmail,
        email,
        'Application Update - GCECT Art Club',
        htmlContent
      );

      const result = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: message,
        },
      });

      console.log(`✅ Rejection email sent to ${email}`);
      return { success: true, messageId: result.data.id };
    } catch (error) {
      console.error(`❌ Failed to send rejection email: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  createEmailMessage(from, to, subject, htmlContent) {
    const email = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      htmlContent,
    ].join('\n');

    return Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  }

  generateApprovalEmailHTML(memberName, clubName, clubDescription, instagramUrl, contactEmail) {
    // Same HTML template as before
    return `<!DOCTYPE html>...`; // Use the same template from emailServiceResend
  }

  generateRejectionEmailHTML(memberName, clubName, adminNotes, contactEmail) {
    // Same HTML template as before
    return `<!DOCTYPE html>...`; // Use the same template from emailServiceResend
  }
}

module.exports = new GmailAPIEmailService();
```

---

## Step 8: Test Gmail API

Create `backend/test_gmail_api.js`:

```bash
node backend/test_gmail_api.js
```

---

## Step 9: Update Application Controller

Change in `application.controller.js`:

```javascript
const emailService = require("../services/emailServiceGmailAPI");
```

Instead of:
```javascript
const emailService = require("../services/emailServiceResend");
```

---

## Troubleshooting

### "Credentials file not found"
- Make sure `gmail-credentials.json` is in project root
- Check filename is correct

### "Gmail API not enabled"
- Go to: https://console.cloud.google.com/apis/library
- Search for "Gmail API"
- Click "ENABLE"

### "Permission denied"
- Check service account has proper permissions
- Make sure domain-wide delegation is enabled
- Verify the service account email is correct

### "Quota exceeded"
- Gmail API has daily quotas
- Check your quota: https://console.cloud.google.com/apis/dashboard

---

## Benefits of Gmail API

✅ Full email control
✅ Read and manage emails
✅ Search capabilities
✅ More reliable than SMTP
✅ Better for automation
✅ No password needed (uses OAuth)

---

## When Ready for Production

1. Verify everything works locally
2. Add `gmail-credentials.json` to production securely
3. Update environment variables on production server
4. Test email sending in production

---

## Resources

- Gmail API Docs: https://developers.google.com/gmail/api
- Google Cloud Console: https://console.cloud.google.com
- OAuth Setup Guide: https://developers.google.com/identity/protocols/oauth2

---

**Note**: This is more complex than Resend but gives you full Gmail control!

Would you like me to implement the full Gmail API service?
