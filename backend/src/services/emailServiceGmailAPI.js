/**
 * Gmail API Email Service
 * Sends emails using Gmail API with OAuth
 * More reliable and feature-rich than SMTP
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GmailAPIEmailService {
  constructor() {
    this.auth = null;
    this.gmail = null;
    this.initialized = false;
    this.initializeGmailAPI();
  }

  /**
   * Initialize Gmail API with service account credentials
   */
  async initializeGmailAPI() {
    try {
      const credentialsPath = process.env.GMAIL_CREDENTIALS_PATH;

      if (!credentialsPath) {
        console.log('ℹ️  GMAIL_CREDENTIALS_PATH not set in environment');
        return;
      }

      const fullPath = path.resolve(credentialsPath);

      if (!fs.existsSync(fullPath)) {
        console.warn(`⚠️  Gmail credentials file not found at: ${fullPath}`);
        console.warn('   Set GMAIL_CREDENTIALS_PATH in .env to enable Gmail API');
        return;
      }

      const credentials = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

      this.auth = new google.auth.GoogleAuth({
        keyFile: fullPath,
        scopes: [
          'https://www.googleapis.com/auth/gmail.send',
          'https://www.googleapis.com/auth/gmail.readonly',
        ],
      });

      this.gmail = google.gmail({ version: 'v1', auth: this.auth });
      this.initialized = true;
      console.log('✅ Gmail API service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Gmail API:', error.message);
      this.initialized = false;
    }
  }

  /**
   * Check if Gmail API service is available
   */
  isAvailable() {
    return this.initialized && this.gmail !== null;
  }

  /**
   * Send approval email using Gmail API
   */
  async sendApprovalEmail(memberData, clubInfo = {}) {
    if (!this.isAvailable()) {
      console.log('ℹ️  Gmail API service unavailable. Skipping approval email.');
      return { success: false, reason: 'Gmail API not configured' };
    }

    try {
      const { fullName, email } = memberData;
      const clubDescription = clubInfo.description || 'We are a vibrant community dedicated to celebrating and promoting art across all mediums.';
      const clubName = clubInfo.name || 'GCECT Art Club - Brush and Bond';
      const instagramUrl = clubInfo.instagramUrl || '#';
      const contactEmail = clubInfo.contactEmail || 'brushandbondgcect22@gmail.com';

      const htmlContent = this.generateApprovalEmailHTML(
        fullName,
        clubName,
        clubDescription,
        instagramUrl,
        contactEmail
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

      console.log(`✅ Approval email sent to ${email} via Gmail API`);
      console.log(`   Message ID: ${result.data.id}`);
      return { success: true, messageId: result.data.id };
    } catch (error) {
      console.error(`❌ Failed to send approval email to ${memberData.email}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send rejection email using Gmail API
   */
  async sendRejectionEmail(memberData, adminNotes = '', clubInfo = {}) {
    if (!this.isAvailable()) {
      console.log('ℹ️  Gmail API service unavailable. Skipping rejection email.');
      return { success: false, reason: 'Gmail API not configured' };
    }

    try {
      const { fullName, email } = memberData;
      const clubName = clubInfo.name || 'GCECT Art Club - Brush and Bond';
      const contactEmail = clubInfo.contactEmail || 'brushandbondgcect22@gmail.com';

      const htmlContent = this.generateRejectionEmailHTML(
        fullName,
        clubName,
        adminNotes,
        contactEmail
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

      console.log(`✅ Rejection email sent to ${email} via Gmail API`);
      console.log(`   Message ID: ${result.data.id}`);
      return { success: true, messageId: result.data.id };
    } catch (error) {
      console.error(`❌ Failed to send rejection email to ${memberData.email}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create base64 encoded email message for Gmail API
   */
  createEmailMessage(from, to, subject, htmlContent) {
    const email = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: quoted-printable',
      '',
      htmlContent,
    ].join('\r\n');

    // Convert to base64 and make it URL-safe
    return Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Generate HTML content for approval email
   */
  generateApprovalEmailHTML(memberName, clubName, clubDescription, instagramUrl, contactEmail) {
    const firstName = memberName.split(' ')[0];

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .logo-header {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .logo-header img {
      max-width: 150px;
      height: auto;
      margin-bottom: 15px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
      font-weight: 700;
    }
    .header p {
      font-size: 16px;
      opacity: 0.95;
    }
    .content {
      background: white;
      padding: 40px;
      color: #333;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 20px;
    }
    .message {
      line-height: 1.8;
      color: #555;
      margin-bottom: 20px;
    }
    .message p {
      margin-bottom: 15px;
    }
    .highlight {
      background-color: #f0f4ff;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .highlight h3 {
      color: #667eea;
      font-size: 16px;
      margin-bottom: 10px;
    }
    .highlight p {
      color: #666;
      margin: 8px 0;
    }
    .footer {
      background: #f9f9f9;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #eee;
      font-size: 13px;
      color: #888;
    }
    .footer p {
      margin: 8px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo-header">
      <img src="https://brushandbond.netlify.app/images/logo.jpg" alt="Brush and Bond Logo" style="max-width: 150px; height: auto;">
    </div>
    
    <div class="header">
      <h1>Welcome to ${clubName}!</h1>
      <p>Your Application Has Been Approved</p>
    </div>

    <div class="content">
      <div class="greeting">Congratulations, ${firstName}! 🎉</div>

      <div class="message">
        <p>We are thrilled to inform you that <strong>your application to join Brush and Bond has been approved!</strong></p>
        <p>You are now an official member of our vibrant community of artists and creative minds.</p>
      </div>

      <div class="highlight">
        <h3>About Brush and Bond</h3>
        <p>${clubDescription}</p>
      </div>

      <div class="message">
        <p><strong>What's Next?</strong></p>
        <p>• Stay tuned for upcoming events, workshops, and exhibitions<br>
           • Check our announcements page for important updates<br>
           • Connect with fellow members and share your creative work<br>
           • Participate in collaborative art projects</p>
      </div>
    </div>

    <div class="footer">
      <div class="social-links">
        <a href="${instagramUrl}">📱 Follow us on Instagram</a>
      </div>
      <p>Questions? Feel free to reach out to us!</p>
      <p>📧 <strong>${contactEmail}</strong></p>
      <p style="margin-top: 20px; color: #aaa; font-size: 12px;">
        © 2024 ${clubName}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate HTML content for rejection email
   */
  generateRejectionEmailHTML(memberName, clubName, adminNotes, contactEmail) {
    const firstName = memberName.split(' ')[0];

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .logo-header {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .logo-header img {
      max-width: 150px;
      height: auto;
      margin-bottom: 15px;
    }
    .header {
      background: linear-gradient(135deg, #ee7752 0%, #e73c7e 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 24px;
      margin-bottom: 10px;
      font-weight: 700;
    }
    .content {
      padding: 40px;
      color: #333;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .message {
      line-height: 1.8;
      color: #555;
      margin-bottom: 20px;
    }
    .message p {
      margin-bottom: 15px;
    }
    .admin-notes {
      background-color: #fff8f0;
      border-left: 4px solid #ee7752;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      font-style: italic;
      color: #666;
    }
    .footer {
      background: #f9f9f9;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #eee;
      font-size: 13px;
      color: #888;
    }
    .footer p {
      margin: 8px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo-header">
      <img src="https://brushandbond.netlify.app/images/logo.jpg" alt="Brush and Bond Logo" style="max-width: 150px; height: auto;">
    </div>
    
    <div class="header">
      <h1>Application Update</h1>
    </div>

    <div class="content">
      <div class="greeting">Hi ${firstName},</div>

      <div class="message">
        <p>Thank you for your interest in joining <strong>${clubName}</strong>.</p>
        <p>After careful review, we regret to inform you that your application was not selected at this time.</p>
      </div>

      ${adminNotes ? `<div class="admin-notes"><strong>Feedback:</strong> ${adminNotes}</div>` : ''}

      <div class="message">
        <p>We encourage you to keep exploring your artistic interests and consider reapplying in the future.</p>
        <p>We wish you all the best in your creative journey!</p>
      </div>
    </div>

    <div class="footer">
      <p>If you have any questions, please contact us</p>
      <p>📧 <strong>${contactEmail}</strong></p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Optional: Read emails from Gmail
   */
  async readEmails(query = 'is:unread') {
    if (!this.isAvailable()) {
      console.log('ℹ️  Gmail API service unavailable');
      return { success: false, emails: [] };
    }

    try {
      const result = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
      });

      console.log(`✅ Retrieved ${result.data.messages?.length || 0} emails`);
      return { success: true, emails: result.data.messages || [] };
    } catch (error) {
      console.error('❌ Failed to read emails:', error.message);
      return { success: false, emails: [], error: error.message };
    }
  }
}

module.exports = new GmailAPIEmailService();
