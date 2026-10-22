# Email Automation - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Email Provider

**Choose one email provider:**

#### Option A: Gmail (Easiest for Development)
```bash
# 1. Go to: https://myaccount.google.com/apppasswords
# 2. Generate App Password (requires 2FA enabled)
# 3. Add to .env:

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=Brush and Bond <noreply@brushandbond.gcect.edu>
```

#### Option B: SendGrid (Production Recommended)
```bash
# 1. Create account at sendgrid.com
# 2. Get API key from settings
# 3. Add to .env:

EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your-long-api-key
EMAIL_FROM=Brush and Bond <noreply@brushandbond.gcect.edu>
```

#### Option C: AWS SES
```bash
# 1. Verify sender in AWS SES console
# 2. Create SMTP credentials
# 3. Add to .env:

EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-ses-username
EMAIL_PASSWORD=your-ses-password
EMAIL_FROM=Brush and Bond <noreply@brushandbond.gcect.edu>
```

### 3. Add Club Information to .env
```bash
CLUB_NAME=GCECT Art Club - Brush and Bond
CLUB_INSTAGRAM_URL=https://instagram.com/brushandbond
CLUB_EMAIL=brushandbond@gcect.edu
CLUB_DESCRIPTION=We are a vibrant community of artists dedicated to celebrating art in all forms.
```

### 4. Start the Backend
```bash
npm start
```

## ✅ Testing Email Sending

### Test from Admin Dashboard
1. Open Admin Dashboard (http://localhost:3000/admin)
2. Go to "Manage Applications"
3. Click "Approve" on any pending application
4. Check applicant's email inbox (or spam folder)
5. Should receive "🎨 Welcome to Brush and Bond!" email

### Test Rejection Email
1. Go back to Applications
2. Click on another application
3. Click "Reject" and add optional feedback
4. Check applicant's email for rejection notice

## 📊 Flow Diagram

```
User Fills Form
    ↓
Application Submitted (Status: PENDING)
    ↓
Admin Reviews in Dashboard
    ↓
Admin Clicks "Approve" or "Reject"
    ↓
┌─────────────────┬────────────────┐
↓                 ↓
[APPROVED]       [REJECTED]
    ↓                 ↓
Create Member   Send Rejection
    ↓           Email with
Send Welcome    Feedback
Email
    ↓
Personalized
Congratulations
Email Arrives
```

## 🔧 Troubleshooting

### Email not sending?
```bash
# Check 1: Is EMAIL_HOST in .env?
grep EMAIL_HOST .env

# Check 2: Check backend logs for error messages
# Look for: "❌ Failed to send" or "⚠️  Email service disabled"

# Check 3: Test SMTP connection manually
# (See backend/EMAIL_AUTOMATION_ARCHITECTURE.md for details)
```

### Emails going to spam?
- Set up SPF and DKIM records with your email provider
- Use a proper domain name in EMAIL_FROM, not generic addresses
- Ask recipients to mark emails as "Not Spam"

### Email provider rate limit hit?
- Most providers allow 100-300 emails/day for free tier
- Contact provider support to increase limits
- Consider switching to paid SendGrid plan for production

## 📧 Email Content

### Approval Email
- **To**: Applicant's email
- **Subject**: 🎨 Welcome to Brush and Bond! Your Application is Approved
- **Contains**:
  - Personalized greeting (uses first name)
  - Welcome message
  - Club description
  - Next steps
  - Social media links
  - Contact information

### Rejection Email
- **To**: Applicant's email
- **Subject**: Application Update - GCECT Art Club
- **Contains**:
  - Professional rejection notice
  - Admin's feedback (if provided)
  - Encouragement to reapply
  - Contact information

## 🔐 Security Notes

1. **Never commit `.env` with real credentials**
2. **Use app-specific passwords** (not main account password)
3. **Rotate credentials periodically**
4. **Monitor email provider for suspicious activity**
5. **Keep nodemailer package updated** for security patches

## 📱 Email Preview

### Approval Email Preview
```
┌─────────────────────────────────────────┐
│         🎨 Welcome to Brush and Bond!   │
│      Your Application Has Been Approved │
└─────────────────────────────────────────┘

Congratulations, [Name]! 🎉

We are thrilled to inform you that your application 
to join Brush and Bond has been APPROVED!

You are now an official member of our vibrant community.

About Brush and Bond:
We are a vibrant community of artists and creatives...

What's Next?
• Stay tuned for upcoming events
• Check announcements page
• Connect with fellow members
• Participate in collaborations

Follow us on Instagram | Contact us
```

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Set up email provider credentials
3. ✅ Configure .env file
4. ✅ Test by approving/rejecting an application
5. ✅ Deploy to production

## 📞 Support

For issues with:
- **Gmail**: Check https://support.google.com/mail
- **SendGrid**: Check https://sendgrid.com/docs
- **AWS SES**: Check https://docs.aws.amazon.com/ses
- **App-specific**: See backend/EMAIL_AUTOMATION_ARCHITECTURE.md

## ✨ Key Features

✅ Personalized emails with member names
✅ Beautiful responsive email templates
✅ Admin-controlled approval/rejection
✅ Graceful error handling (won't break if email fails)
✅ Comprehensive logging
✅ Support for multiple email providers
✅ Non-blocking email sending (async)
✅ Easy configuration via .env
