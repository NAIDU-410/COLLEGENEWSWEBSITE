import dotenv from 'dotenv';
dotenv.config();
import sendEmail from './utils/emailService.js';

async function testEmail() {
  try {
    console.log(`Attempting to send a test email from ${process.env.EMAIL_USER} to ${process.env.EMAIL_USER}...`);
    await sendEmail({
      email: process.env.EMAIL_USER,
      subject: 'College News Portal - Email Configuration Success!',
      message: 'Hello! Your Nodemailer configuration is working perfectly. You can now use the "Create Profile" form in the browser, and the 6-digit OTPs will successfully dispatch to users.',
    });
    console.log('SUCCESS: The test email was successfully dispatched! Check your inbox.');
  } catch (error) {
    console.error('ERROR: Failed to send test email. Check your app password or network connection.');
    console.error(error.message);
  }
}

testEmail();
