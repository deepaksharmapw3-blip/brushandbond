/**
 * Email Service with Resend
 * Modern, reliable email service for Brush and Bond
 * Uses Resend API for email sending
 */

const { Resend } = require('resend');

class ResendEmailService {
  constructor() {
    this.resend = null;
    this.initialized = false;
    this.initializeResend();
  }

  /**
   * Initialize Resend with API key from environment
   */
  initializeResend() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn('⚠️  Resend API key not found in environment');
      console.warn('   Set RESEND_API_KEY in .env to enable email sending');
      return;
    }

    try {
      this.resend = new Resend(apiKey);
      this.initialized = true;
      console.log('✅ Email service initialized (Resend)');
    } catch (error) {
      console.error('❌ Failed to initialize Resend:', error.message);
    }
  }

  /**
   * Check if email service is available
   */
  isAvailable() {
    return this.initialized && this.resend !== null;
  }

  /**
   * Send approval email to new member
   */
  async sendApprovalEmail(memberData, clubInfo = {}) {
    if (!this.isAvailable()) {
      console.log('ℹ️  Email service unavailable. Skipping approval email.');
      return { success: false, reason: 'Email service not configured' };
    }

    try {
      const { fullName, email } = memberData;
      const clubDescription = clubInfo.description || 'We are a vibrant community dedicated to celebrating and promoting art across all mediums.';
      const clubName = clubInfo.name || 'GCECT Art Club - Brush and Bond';
      const instagramUrl = clubInfo.instagramUrl || '#';
      const contactEmail = clubInfo.contactEmail || process.env.EMAIL_FROM || 'brushandbondgcect22@gmail.com';

      const htmlContent = this.generateApprovalEmailHTML(fullName, clubName, clubDescription, instagramUrl, contactEmail);

      const result = await this.resend.emails.send({
        from: 'Brush and Bond <onboarding@resend.dev>',
        to: email,
        subject: '🎨 Welcome to Brush and Bond! Your Application is Approved',
        html: htmlContent,
        replyTo: contactEmail,
      });

      if (result.error) {
        console.error(`❌ Failed to send approval email to ${email}:`, result.error.message);
        return { success: false, error: result.error.message };
      }

      console.log(`✅ Approval email sent to ${email}`);
      console.log(`   Message ID: ${result.data.id}`);
      return { success: true, messageId: result.data.id };
    } catch (error) {
      console.error(`❌ Failed to send approval email to ${memberData.email}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send rejection email to applicant
   */
  async sendRejectionEmail(memberData, adminNotes = '', clubInfo = {}) {
    if (!this.isAvailable()) {
      console.log('ℹ️  Email service unavailable. Skipping rejection email.');
      return { success: false, reason: 'Email service not configured' };
    }

    try {
      const { fullName, email } = memberData;
      const clubName = clubInfo.name || 'GCECT Art Club - Brush and Bond';
      const contactEmail = clubInfo.contactEmail || process.env.EMAIL_FROM || 'brushandbondgcect22@gmail.com';

      const htmlContent = this.generateRejectionEmailHTML(fullName, clubName, adminNotes, contactEmail);

      const result = await this.resend.emails.send({
        from: 'Brush and Bond <onboarding@resend.dev>',
        to: email,
        subject: 'Application Update - GCECT Art Club',
        html: htmlContent,
        replyTo: contactEmail,
      });

      if (result.error) {
        console.error(`❌ Failed to send rejection email to ${email}:`, result.error.message);
        return { success: false, error: result.error.message };
      }

      console.log(`✅ Rejection email sent to ${email}`);
      console.log(`   Message ID: ${result.data.id}`);
      return { success: true, messageId: result.data.id };
    } catch (error) {
      console.error(`❌ Failed to send rejection email to ${memberData.email}:`, error.message);
      return { success: false, error: error.message };
    }
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
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
    .cta-section {
      margin: 30px 0;
      text-align: center;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
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
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }
    .emoji {
      font-size: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">🎨</div>
      <h1>Welcome to ${clubName}!</h1>
      <p>Your Application Has Been Approved</p>
    </div>

    <div class="content">
      <div class="greeting">Congratulations, ${firstName}! 🎉</div>

      <div class="message">
        <p>We are thrilled to inform you that <strong>your application to join Brush and Bond has been approved!</strong></p>

        <p>You are now an official member of our vibrant community of artists and creative minds. Get ready for an exciting journey of artistic exploration, collaboration, and growth.</p>
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

      <div class="cta-section">
        <p>We can't wait to create something amazing with you!</p>
      </div>
    </div>

    <div class="footer">
      <div class="social-links">
        <a href="${instagramUrl}" target="_blank">📱 Follow us on Instagram</a>
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
    <div class="header">
      <h1>Application Update</h1>
    </div>

    <div class="content">
      <div class="greeting">Hi ${firstName},</div>

      <div class="message">
        <p>Thank you for your interest in joining <strong>${clubName}</strong>. We appreciate the time and effort you put into your application.</p>

        <p>After careful review, we regret to inform you that your application was not selected at this time.</p>
      </div>

      ${adminNotes ? `<div class="admin-notes"><strong>Feedback:</strong> ${adminNotes}</div>` : ''}

      <div class="message">
        <p>We encourage you to:</p>
        <p>• Keep exploring your artistic interests<br>
           • Consider reapplying in the future<br>
           • Feel free to reach out with any questions</p>

        <p>We appreciate your understanding and wish you all the best in your creative journey!</p>
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
}

module.exports = new ResendEmailService();
