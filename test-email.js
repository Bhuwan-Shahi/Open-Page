// Test email functionality
import { sendOTPEmail, sendWelcomeEmail, generateOTP } from './src/lib/email.js';

async function testEmail() {
  try {
    console.log('🧪 Testing email functionality...');
    
    // Test OTP email
    const otp = generateOTP();
    console.log('\n📧 Testing OTP Email...');
    const otpResult = await sendOTPEmail('shahibhuwan265@gmail.com', otp, 'verification');
    console.log('OTP Result:', otpResult);
    
    // Test welcome email
    console.log('\n📧 Testing Welcome Email...');
    const welcomeResult = await sendWelcomeEmail('shahibhuwan265@gmail.com', 'Bhuwan Shahi');
    console.log('Welcome Result:', welcomeResult);
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

testEmail();
