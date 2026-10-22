/**
 * Test Resend Email Service
 * Run: node backend/test_resend.js
 */

require('dotenv').config();
const emailService = require('./src/services/emailServiceResend');

console.log('\n🧪 Testing Resend Email Service\n');
console.log('=' .repeat(60));

// Check configuration
console.log('\n📋 Configuration:\n');
console.log(`  RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`  EMAIL_FROM: ${process.env.EMAIL_FROM || 'Not set'}`);
console.log(`  CLUB_NAME: ${process.env.CLUB_NAME || 'Not set'}`);

// Check service status
console.log('\n📊 Service Status:\n');
if (emailService.isAvailable()) {
  console.log('  ✅ Email service is AVAILABLE');
} else {
  console.log('  ❌ Email service is NOT AVAILABLE');
  console.log('  Check RESEND_API_KEY in .env');
  process.exit(1);
}

// Send test email
console.log('\n✉️  Sending Test Email...\n');

const testData = {
  fullName: 'Test User',
  email: 'brushandbondgcect22@gmail.com', // Must use registered email in Resend test mode
};

const clubInfo = {
  name: process.env.CLUB_NAME || 'GCECT Art Club - Brush and Bond',
  description: process.env.CLUB_DESCRIPTION || 'Test club description',
  instagramUrl: process.env.CLUB_INSTAGRAM_URL || 'https://instagram.com/brushandbond',
  contactEmail: process.env.CLUB_EMAIL || 'brushandbondgcect22@gmail.com',
};

emailService.sendApprovalEmail(testData, clubInfo).then((result) => {
  console.log('\n📊 Result:\n');
  console.log(`  Success: ${result.success ? '✅ Yes' : '❌ No'}`);
  if (result.messageId) {
    console.log(`  Message ID: ${result.messageId}`);
  }
  if (result.error) {
    console.log(`  Error: ${result.error}`);
  }

  console.log('\n' + '=' .repeat(60));

  if (result.success) {
    console.log('\n✅ TEST PASSED - Email service is working!\n');
    console.log('Check your email (deepaksharmapw3@gmail.com) for the test email.');
    console.log('\nYou can now:');
    console.log('1. Start the backend: npm run api');
    console.log('2. Submit applications via the website');
    console.log('3. Approve them in the admin dashboard');
    console.log('4. Members will receive approval emails via Resend\n');
  } else {
    console.log('\n❌ TEST FAILED - Check the error above\n');
  }

  console.log('=' .repeat(60) + '\n');
  process.exit(result.success ? 0 : 1);
});
