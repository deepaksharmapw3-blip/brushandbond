# Email Automation Architecture - Brush and Bond

## Overview

This document describes the email automation system for Brush and Bond that sends personalized congratulations emails to applicants when their membership applications are approved or rejected by the admin.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Submission Flow                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
                   /api/applications (POST)
                              ↓
                  Application stored in DB (PENDING)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Admin Review Dashboard                     │
│         GET /api/applications (retrieve all pending)         │
│    Admin reviews application & clicks Approve/Reject        │
└─────────────────────────────────────────────────────────────┘
                              ↓
         PATCH /api/applications/:id/status
              (status=APPROVED/REJECTED)
                              ↓
         ┌──────────────────────────────────────┐
         │                                      │
         ↓                                      ↓
    [APPROVED]                            [REJECTED]
         │                                      │
         ├─► Update DB (APPROVED)               └─► Update DB (REJECTED)
         │                                           │
         ├─► Create member record                     │
         │                                           │
         └─► emailService.sendApprovalEmail()        │
             │                                        │
             ├─► Fetch CLUB_INFO                     │
             │                                        │
             ├─► Generate HTML template              └─► emailService.sendRejectionEmail()
             │   (personalized with member name)          │
             │                                            ├─► Generate HTML template
             ├─► Send via SMTP                            │   (with feedback notes)
             │                                            │
             └─► Log result (success/error)               └─► Send via SMTP
                                                               │
                                                               └─► Log result
                                                                    │
┌─────────────────────────────────────────────────────────────┐   │
│                 Member Email Received                        │◄──┘
├─────────────────────────────────────────────────────────────┤
│ Subject: 🎨 Welcome to Brush and Bond!                      │
│         Your Application is Approved                        │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Congratulations, [Member Name]! 🎉                    │  │
│ │                                                        │  │
│ │ We are thrilled to inform you that your application   │  │
│ │ to join Brush and Bond has been APPROVED!             │  │
│ │                                                        │  │
│ │ [Club Description & Next Steps]                       │  │
│ │                                                        │  │
│ │ Follow us on Instagram | Contact us                   │  │
│ └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## System Components

### 1. **Email Service** (`backend/src/services/emailService.js`)

The core email service that handles all email operations.

#### Features:
- **Initialization**: Validates SMTP configuration on startup
- **Transport Management**: Creates nodemailer transporter with environment credentials
- **Health Check**: `isAvailable()` method ensures email service is properly configured
- **Email Sending**: Async methods for different email types
- **HTML Template Generation**: Creates beautiful, responsive email templates

#### Key Methods:

```javascript
// Initialize transporter with SMTP credentials
initializeTransporter()

// Send approval email
sendApprovalEmail(memberData, clubInfo)
  - memberData: { fullName, email }
  - clubInfo: { name, description, instagramUrl, contactEmail }
  - Returns: { success, messageId/error }

// Send rejection email
sendRejectionEmail(memberData, adminNotes, clubInfo)
  - memberData: { fullName, email }
  - adminNotes: Feedback reason from admin
  - clubInfo: Club information
  - Returns: { success, messageId/error }

// Generate approval email HTML
generateApprovalEmailHTML(memberName, clubName, description, instagramUrl, contactEmail)

// Generate rejection email HTML
generateRejectionEmailHTML(memberName, clubName, adminNotes, contactEmail)
```

### 2. **Application Controller** (`backend/src/controllers/application.controller.js`)

Updated to integrate email sending into the approval workflow.

#### Key Changes:

```javascript
// Imports email service
const emailService = require("../services/emailService");

// Club information constant (used in email templates)
const CLUB_INFO = {
  name: "GCECT Art Club - Brush and Bond",
  description: "Vibrant community of artists...",
  instagramUrl: process.env.CLUB_INSTAGRAM_URL,
  contactEmail: process.env.CLUB_EMAIL,
};

// Updated updateApplicationStatus() to:
// 1. Update application status in DB
// 2. Create member record if APPROVED
// 3. Send appropriate email (approval or rejection)
// 4. Log email result
```

### 3. **Email Templates**

#### Approval Email Template
- **Subject**: "🎨 Welcome to Brush and Bond! Your Application is Approved"
- **Content**: 
  - Personalized greeting with member's first name
  - Congratulations message
  - Club description and mission
  - What's next (events, workshops, etc.)
  - Social media links
  - Contact information
- **Design**: Gradient purple theme, modern responsive layout

#### Rejection Email Template
- **Subject**: "Application Update - GCECT Art Club"
- **Content**:
  - Professional rejection notice
  - Admin feedback/notes (if provided)
  - Encouragement to reapply
  - Contact information for questions
- **Design**: Warm orange theme, empathetic messaging

### 4. **Environment Configuration** (`.env.example`)

Required environment variables for email functionality:

```env
# SMTP Configuration
EMAIL_HOST=smtp.gmail.com          # SMTP server address
EMAIL_PORT=587                     # SMTP port (587 for TLS, 465 for SSL)
EMAIL_SECURE=false                 # Use TLS (false for 587, true for 465)
EMAIL_USER=your-email@gmail.com    # SMTP authentication username
EMAIL_PASSWORD=app-password        # SMTP authentication password
EMAIL_FROM=noreply@brushandbond... # Sender address

# Club Information (for email templates)
CLUB_NAME=GCECT Art Club - Brush and Bond
CLUB_INSTAGRAM_URL=https://instagram.com/brushandbond
CLUB_EMAIL=brushandbond@gcect.edu
CLUB_DESCRIPTION=Vibrant community of artists...
```

## Implementation Steps

### Step 1: Install Nodemailer
```bash
cd backend
npm install nodemailer@6.9.7
```

### Step 2: Configure Environment Variables
```bash
# Copy and edit .env file
cp .env.example .env

# Add SMTP credentials for your email provider
EMAIL_HOST=your-smtp-host
EMAIL_PORT=587
EMAIL_USER=your-email@provider.com
EMAIL_PASSWORD=your-app-specific-password
```

### Step 3: API Flow
1. User submits application → `POST /api/applications`
2. Application stored with status = "PENDING"
3. Admin reviews applications → `GET /api/applications`
4. Admin clicks Approve/Reject → `PATCH /api/applications/:id/status`
5. System automatically sends email with personalized content

## Email Provider Setup Guide

### Gmail Setup (Official Brush and Bond Email)
```
Official Email: brushandbondgcect22@gmail.com

Steps:
1. Go to: https://myaccount.google.com
2. Sign in with brushandbondgcect22@gmail.com
3. Ensure 2-Factor Authentication is enabled
4. Go to: https://myaccount.google.com/apppasswords
5. Select App: "Mail"
6. Select Device: "Windows Computer" (or your device)
7. Click "Generate"
8. Copy the 16-character password

Configuration:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=brushandbondgcect22@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=Brush and Bond <brushandbondgcect22@gmail.com>
```

### SendGrid Setup
```
1. Create SendGrid account and verify sender
2. Create API key
3. EMAIL_HOST=smtp.sendgrid.net
4. EMAIL_USER=apikey
5. EMAIL_PASSWORD=your-sendgrid-api-key
6. EMAIL_PORT=587
7. EMAIL_SECURE=false
```

### AWS SES Setup
```
1. Verify sender email in SES console
2. Create SMTP credentials
3. EMAIL_HOST=email-smtp.region.amazonaws.com
4. EMAIL_USER=your-ses-username
5. EMAIL_PASSWORD=your-ses-password
6. EMAIL_PORT=587
7. EMAIL_SECURE=false
```

### Mailgun Setup
```
1. Create Mailgun account and add domain
2. Verify domain
3. EMAIL_HOST=smtp.mailgun.org
4. EMAIL_USER=postmaster@your-domain.mailgun.org
5. EMAIL_PASSWORD=your-mailgun-password
6. EMAIL_PORT=587
7. EMAIL_SECURE=false
```

## API Endpoints

### Approve Application with Email
```
PATCH /api/applications/:id/status
Content-Type: application/json

{
  "status": "APPROVED",
  "adminNotes": "Great portfolio! Welcome to the club." (optional)
}

Response:
{
  "success": true,
  "message": "Application approved successfully",
  "application": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "status": "APPROVED",
    "reviewedAt": "2024-10-22T10:30:00Z"
  }
}
```

### Reject Application with Email
```
PATCH /api/applications/:id/status
Content-Type: application/json

{
  "status": "REJECTED",
  "adminNotes": "We encourage you to develop your portfolio further and apply next year."
}

Response:
{
  "success": true,
  "message": "Application rejected successfully",
  "application": {
    "id": 1,
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "status": "REJECTED",
    "adminNotes": "We encourage you...",
    "reviewedAt": "2024-10-22T10:31:00Z"
  }
}
```

## Error Handling

The email service handles errors gracefully:

```javascript
// If email service is not configured:
// ✅ Application status is still updated
// ✅ Member record is still created (if approved)
// ℹ️  Email is skipped with warning log
// ✅ API returns success response

// If SMTP fails:
// ✅ Error is logged to console
// ✅ Application status update proceeds
// ✅ Returns success response (email failure is non-blocking)
```

## Logging

Email operations are logged for monitoring:

```javascript
// Successful email send
✅ Approval email sent to john@example.com

// Failed email send
❌ Failed to send approval email to john@example.com: Connection refused

// Service initialization
✅ Email service initialized
⚠️  Email service disabled. Missing config: EMAIL_HOST, EMAIL_PORT
ℹ️  Email service unavailable. Skipping approval email.
```

## Security Considerations

1. **Credentials**: Never commit `.env` file with real credentials
2. **Passwords**: Use app-specific passwords or API keys, never main account password
3. **Sender Address**: Use noreply or dedicated email address
4. **Rate Limiting**: SMTP providers may have rate limits
5. **Data Privacy**: Email addresses are handled securely, logs do not contain passwords
6. **Non-blocking**: Email failures don't block application status updates

## Testing Email

### Manual Test in Development
```javascript
// In Node.js REPL or test script
const emailService = require('./backend/src/services/emailService.js');

// Test sending
await emailService.sendApprovalEmail(
  { fullName: "Test User", email: "your-email@test.com" },
  { name: "Test Club", description: "Test club description", instagramUrl: "#", contactEmail: "club@test.com" }
);
```

### Check Email Service Status
```javascript
if (emailService.isAvailable()) {
  console.log("✅ Email service is ready");
} else {
  console.log("❌ Email service not configured");
}
```

## Future Enhancements

1. **Event Emails**: Send emails for upcoming events
2. **Batch Operations**: Send emails to multiple users at once
3. **Email Templates**: Create more email types (password reset, event reminders, etc.)
4. **Email History**: Track sent emails in database
5. **Unsubscribe Links**: Add unsubscribe functionality for compliance
6. **Email Analytics**: Track open rates and clicks
7. **Scheduled Emails**: Send emails at specific times
8. **Email Queue**: Handle high volume with job queue (Bull, RabbitMQ)

## Troubleshooting

### "Email service disabled. Missing config"
- Solution: Set all EMAIL_* variables in .env file

### "SMTP Connection Refused"
- Check EMAIL_HOST and EMAIL_PORT are correct
- Verify SMTP server is accessible from your network
- Check EMAIL_SECURE matches port (587=false, 465=true)

### "Invalid Credentials"
- Verify EMAIL_USER and EMAIL_PASSWORD are correct
- For Gmail: Make sure you're using App Password, not main password
- Check credentials haven't been recently reset

### "Email not received"
- Check spam/junk folder
- Verify sender address (EMAIL_FROM) is allowed by provider
- Check email provider's sending limits haven't been exceeded

## Database Schema

The system uses existing tables:
- `ClubApplication`: Stores application data with status field
- `members`: Created when application is approved

No new tables are required; the email system works with existing schema.
