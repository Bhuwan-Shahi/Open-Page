import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate 6-digit OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email (simplified for testing - will just log the OTP)
export async function sendOTPEmail(email, otpCode, type = 'verification') {
  try {
    // For development, just log the OTP instead of sending email
    console.log(`📧 OTP Email for ${email}: ${otpCode} (${type})`);
    console.log(`📧 In production, this would be sent via SMTP`);
    
    return { success: true };
    
    // Uncomment below for real email sending:
    /*
    const subject = type === 'verification' ? 'Email Verification Code' : 'Login Verification Code';
    const htmlContent = generateOTPEmailHTML(otpCode, type);
    
    const mailOptions = {
      from: `"Open Book" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    */
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
}

// Send welcome email (simplified for testing)
export async function sendWelcomeEmail(email, name) {
  try {
    // For development, just log the welcome email
    console.log(`📧 Welcome Email for ${name} (${email})`);
    console.log(`📧 In production, this would be sent via SMTP`);
    
    return { success: true };
    
    // Uncomment below for real email sending:
    
    const htmlContent = generateWelcomeEmailHTML(name);
    
    const mailOptions = {
      from: `"Open Book" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to Open Book!',
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Welcome email sending error:', error);
    return { success: false, error: error.message };
  }
}
