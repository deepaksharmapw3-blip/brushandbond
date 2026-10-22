/**
 * Email Diagnostic Script
 * Diagnoses email configuration and SMTP connection issues
 * Run: node backend/diagnose_email.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('\n🔍 EMAIL DIAGNOSTIC REPORT\n');
console.log('=' .repeat(60));

// 1. Check Environment Configuration
console.log('\n📋 1. ENVIRONMENT CONFIGURATION CHECK\n');

const required = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD', 'EMAIL_FROM'];
const missing = [];

required.forEach(env => {
  if (process.env[env]) {
    console.log(`  ✅ ${env}: Configured`);
  } else {
    console.log(`  ❌ ${env}: MISSING`);
    missing.push(env);
  }
});

if (missing.length > 0) {
  console.log(`\n⚠️  Missing ${missing.length} required variables!`);
  console.log('Add them to .env file:\n');
  missing.forEach(env => console.log(`  ${env}=value`));
  process.exit(1);
}

// 2. Check Gmail Configuration
console.log('\n📧 2. GMAIL CONFIGURATION CHECK\n');

const isGmail = process.env.EMAIL_USER && process.env.EMAIL_USER.includes('gmail.com');
if (isGmail) {
  console.log(`  ✅ Using Gmail account: ${process.env.EMAIL_USER}`);
  
  const hasAppPassword = process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD.length === 16 && process.env.EMAIL_PASSWORD.includes(' ');
  
  if (hasAppPassword) {
    console.log(`  ✅ App Password format looks correct (16 chars with spaces)`);
  } else {
    console.log(`  ⚠️  WARNING: Password format doesn't look like Gmail App Password`);
    console.log(`      Gmail App Passwords should be 16 characters with spaces (e.g., "abcd efgh ijkl mnop")`);
    console.log(`      Current format: ${process.env.EMAIL_PASSWORD.substring(0, 10)}...`);
    console.log(`\n  🔴 ISSUE DETECTED: You're using the account password, not App Password!`);
    console.log(`  Gmail blocks SMTP with regular passwords for security.`);
    console.log(`\n  ✅ SOLUTION:`);
    console.log(`  1. Go to: https://myaccount.google.com/apppasswords`);
    console.log(`  2. Sign in with: ${process.env.EMAIL_USER}`);
    console.log(`  3. Select "Mail" and "Windows Computer"`);
    console.log(`  4. Click "Generate"`);
    console.log(`  5. Copy the 16-character password`);
    console.log(`  6. Update EMAIL_PASSWORD in .env`);
    console.log(`  7. Restart backend\n`);
  }
} else {
  console.log(`  ℹ️  Using non-Gmail account: ${process.env.EMAIL_USER}`);
}

// 3. Test SMTP Connection
console.log('\n🔌 3. SMTP CONNECTION TEST\n');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  logger: false,
  debug: false,
});

transporter.verify((error, success) => {
  if (error) {
    console.log(`  ❌ SMTP Connection Failed`);
    console.log(`  Error: ${error.message}`);
    console.log(`\n  Troubleshooting:`);
    console.log(`  1. Check EMAIL_HOST: ${process.env.EMAIL_HOST}`);
    console.log(`  2. Check EMAIL_PORT: ${process.env.EMAIL_PORT}`);
    console.log(`  3. Check EMAIL_SECURE: ${process.env.EMAIL_SECURE}`);
    console.log(`  4. Check EMAIL_PASSWORD format (Gmail: use App Password)`);
    console.log(`  5. Verify internet connection`);
    console.log(`  6. Check if Gmail account allows SMTP\n`);
  } else {
    console.log(`  ✅ SMTP Connection Successful!`);
    console.log(`  Connected to: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);
  }

  // 4. Send Test Email
  console.log('\n✉️  4. SEND TEST EMAIL\n');

  if (!error) {
    const testEmail = process.env.EMAIL_USER; // Send to self for testing

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: testEmail,
      subject: '🧪 Test Email from Brush and Bond - Email Automation Setup',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">✅ Email Service Test Successful!</h2>
          <p>This is a test email from the Brush and Bond email automation system.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr>
          <p style="color: #888; font-size: 12px;">
            If you received this email, your SMTP configuration is working correctly.
            <br/>
            You can now approve applications and members will receive approval emails.
          </p>
        </div>
      `,
    };

    console.log(`  Attempting to send test email to: ${testEmail}\n`);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(`  ❌ Failed to send test email`);
        console.log(`  Error: ${error.message}`);
        
        if (error.message.includes('Invalid login')) {
          console.log(`\n  🔴 AUTHENTICATION FAILED!`);
          console.log(`  This usually means:`);
          console.log(`  1. Username is incorrect`);
          console.log(`  2. Password is incorrect`);
          console.log(`  3. You're using regular password instead of App Password`);
          console.log(`  4. 2-Factor Authentication is not enabled`);
          console.log(`\n  For Gmail:`);
          console.log(`  - Enable 2-Factor Authentication first`);
          console.log(`  - Then generate an App Password`);
          console.log(`  - Use the 16-character App Password, not your regular password`);
        }
      } else {
        console.log(`  ✅ Test email sent successfully!`);
        console.log(`  Message ID: ${info.messageId}`);
        console.log(`  Response: ${info.response}`);
        console.log(`\n  📧 Check your inbox (or spam folder) for the test email.`);
        console.log(`  If received, your email automation is working!`);
      }

      // Final report
      console.log('\n' + '=' .repeat(60));
      console.log('\n📊 FINAL STATUS:\n');

      if (!error && success) {
        console.log('✅ ALL CHECKS PASSED - Email automation is ready!');
        console.log('\nYou can now:');
        console.log('1. Start the backend: npm start');
        console.log('2. Submit test applications');
        console.log('3. Approve them in the admin dashboard');
        console.log('4. Members will receive approval emails');
      } else {
        console.log('❌ ISSUES DETECTED - See troubleshooting above');
        console.log('\nMost common cause for Gmail:');
        console.log('Using regular password instead of App Password');
        console.log('\nFollow the SOLUTION steps above to fix.');
      }

      console.log('\n' + '=' .repeat(60) + '\n');
      process.exit(error ? 1 : 0);
    });
  } else {
    console.log('Skipping test email due to SMTP connection failure.\n');
    console.log('=' .repeat(60) + '\n');
    process.exit(1);
  }
});
