# Official Brush and Bond Email Setup

## Official Email Account
**Email**: brushandbondgcect22@gmail.com

This is the official email account for Brush and Bond. All outgoing emails (approvals, rejections, notifications) will come from this address.

## Prerequisites
- Access to brushandbondgcect22@gmail.com account
- 2-Factor Authentication enabled on the account

## Step-by-Step Setup

### Step 1: Generate App Password

1. Go to Google Account: https://myaccount.google.com
2. Sign in with: **brushandbondgcect22@gmail.com**
3. Click on "Security" in the left sidebar
4. Under "How you sign in to Google", ensure **2-Step Verification is ON**
   - If not, enable it first
5. Go to https://myaccount.google.com/apppasswords
6. Select dropdown 1: **Mail**
7. Select dropdown 2: **Windows Computer** (or your device type)
8. Click **Generate**
9. Google will show a 16-character password like: `abcd efgh ijkl mnop`
10. **Copy this password** (you'll use it in Step 3)

### Step 2: Install Dependencies

```bash
cd backend
npm install
```

This will install `nodemailer@6.9.7` which is already in package.json

### Step 3: Configure .env File

Create or update `.env` file in the project root:

```bash
# ============================================
# EMAIL AUTOMATION CONFIGURATION
# ============================================
# Official Brush and Bond Gmail Account
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=brushandbondgcect22@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=Brush and Bond <brushandbondgcect22@gmail.com>

# Club Information
CLUB_NAME=GCECT Art Club - Brush and Bond
CLUB_INSTAGRAM_URL=https://instagram.com/brushandbond
CLUB_EMAIL=brushandbondgcect22@gmail.com
CLUB_DESCRIPTION=We are a vibrant community of artists and creatives dedicated to celebrating art in all forms. From traditional paintings to digital art, sculptures to photography, we celebrate diverse artistic expressions.

# ... other configuration variables
```

### Step 4: Restart Backend Server

```bash
npm start
```

You should see:
```
✅ Email service initialized
```

If you see a warning about missing email config, check your .env file.

### Step 5: Test Email Sending

1. Open Admin Dashboard: http://localhost:3000/admin
2. Go to "Manage Applications"
3. Find a pending application
4. Click "Approve" button
5. Check the applicant's email inbox (or spam folder)
6. You should receive an email from: **Brush and Bond <brushandbondgcect22@gmail.com>**

## Email Templates

### Approval Email
- **From**: Brush and Bond <brushandbondgcect22@gmail.com>
- **Subject**: 🎨 Welcome to Brush and Bond! Your Application is Approved
- **Content**: Personalized welcome message with:
  - Member's name
  - Club description
  - Next steps information
  - Instagram follow link
  - Contact information

### Rejection Email
- **From**: Brush and Bond <brushandbondgcect22@gmail.com>
- **Subject**: Application Update - GCECT Art Club
- **Content**:
  - Professional rejection notice
  - Admin's feedback (if provided)
  - Encouragement to reapply
  - Contact information

## Workflow

```
Applicant fills form → Application submitted (PENDING)
                             ↓
                   Admin reviews in dashboard
                             ↓
                  Admin clicks Approve/Reject
                             ↓
         ┌──────────────────┬──────────────────┐
         ↓                  ↓
    [APPROVED]         [REJECTED]
         │                  │
         ├─ Create member   │
         │  record          │
         │                  │
         └─ Send email ────→ Send email
            from official      from official
            account            account
            (with welcome)     (with feedback)
```

## Troubleshooting

### "Email service disabled. Missing config"
✅ **Solution**: Make sure all EMAIL_* variables are in .env file

```bash
# Check these exist in .env:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=brushandbondgcect22@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Brush and Bond <brushandbondgcect22@gmail.com>
```

### "SMTP Connection Refused"
✅ **Solution 1**: Check if 2FA is enabled on the Google account
✅ **Solution 2**: Generate new app password and update .env
✅ **Solution 3**: Verify EMAIL_PORT=587 and EMAIL_SECURE=false

### "Invalid Credentials"
✅ **Solution 1**: Verify the app password (16 characters with spaces)
✅ **Solution 2**: Don't use your regular Google password, use app password only
✅ **Solution 3**: Generate a new app password at https://myaccount.google.com/apppasswords

### Email not received
✅ **Check 1**: Look in spam/junk folder
✅ **Check 2**: Verify recipient email address is correct
✅ **Check 3**: Check backend logs for error messages: `❌ Failed to send`
✅ **Check 4**: Gmail may have rate limits (100-300 emails/day free)

### Emails showing as "from noreply" instead of from official email
✅ **Solution**: Make sure EMAIL_FROM is set correctly:
```
EMAIL_FROM=Brush and Bond <brushandbondgcect22@gmail.com>
```

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit `.env` file with real credentials to Git
- Use `.gitignore` to exclude `.env` file
- The `.env` file is already in `.gitignore`
- App passwords are safer than main account password
- If compromised, you can delete the app password without affecting main account

## Viewing Email Logs

Check backend console to see email sending logs:

```javascript
// Success
✅ Approval email sent to applicant@example.com

// Failed
❌ Failed to send approval email to applicant@example.com: Connection error

// Service not available
ℹ️  Email service unavailable. Skipping approval email.
```

## Production Deployment

When deploying to production:

1. Set these environment variables on your hosting platform:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=brushandbondgcect22@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   EMAIL_FROM=Brush and Bond <brushandbondgcect22@gmail.com>
   ```

2. Do NOT commit credentials to version control

3. Use your platform's environment variable management:
   - Vercel: Project Settings > Environment Variables
   - Netlify: Site Settings > Build & Deploy > Environment
   - Heroku: Config Vars in Settings
   - AWS: Systems Manager > Parameter Store

## Support

For issues:
- Check backend logs for detailed error messages
- Verify 2FA is enabled on brushandbondgcect22@gmail.com
- Check app password hasn't expired (regenerate if needed)
- Test SMTP connection manually if needed

## Summary

✅ Email automation is now integrated with the official Brush and Bond email
✅ Members receive personalized approval emails
✅ Applicants receive feedback on rejections
✅ All emails come from brushandbondgcect22@gmail.com
✅ Setup takes ~5 minutes
✅ Non-blocking (email failures won't affect application processing)
