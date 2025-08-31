import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail', // Use Gmail service
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});rter
const transporter = nodemailer.createTransporter({
  service: 'gmail', // Use Gmail service
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});ailer from 'nodemailer';

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

// Generate OTP email HTML template
function generateOTPEmailHTML(otpCode, type = 'verification') {
  const title = type === 'verification' ? 'Email Verification' : 'Login Verification';
  const message = type === 'verification' 
    ? 'Please use the following code to verify your email address:' 
    : 'Please use the following code to complete your login:';

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${title} - Open Book</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4A90E2; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; text-align: center; }
            .otp-code { font-size: 32px; font-weight: bold; color: #4A90E2; background: white; padding: 15px; border-radius: 8px; margin: 20px 0; letter-spacing: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📚 Open Book</h1>
                <p>${title}</p>
            </div>
            <div class="content">
                <h2>Hello!</h2>
                <p>${message}</p>
                <div class="otp-code">${otpCode}</div>
                <p><strong>This code will expire in 10 minutes.</strong></p>
                <p>If you didn't request this code, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>© 2025 Open Book - Your Digital Library</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Generate welcome email HTML template
function generateWelcomeEmailHTML(name) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Welcome to Open Book!</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4A90E2; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .footer { text-align: center; padding: 20px; color: #666; }
            .feature { margin: 15px 0; padding: 15px; background: white; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📚 Welcome to Open Book!</h1>
                <p>Your digital library awaits</p>
            </div>
            <div class="content">
                <h2>Hello ${name}!</h2>
                <p>Welcome to Open Book - your gateway to amazing digital books! We're excited to have you join our community of book lovers.</p>
                
                <div class="feature">
                    <h3>🛍️ What You Can Do:</h3>
                    <ul>
                        <li>Browse our collection of books</li>
                        <li>Purchase and download books instantly</li>
                        <li>Access your library anytime</li>
                        <li>Get support when you need it</li>
                    </ul>
                </div>
                
                <div class="feature">
                    <h3>🚀 Getting Started:</h3>
                    <ol>
                        <li>Browse our book catalog</li>
                        <li>Add books to your cart</li>
                        <li>Complete secure payment</li>
                        <li>Download your books instantly</li>
                    </ol>
                </div>
                
                <p>If you have any questions, feel free to contact our support team.</p>
                <p>Happy reading!</p>
                <p><strong>The Open Book Team</strong></p>
            </div>
            <div class="footer">
                <p>© 2025 Open Book - Your Digital Library</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Send OTP email
export async function sendOTPEmail(email, otpCode, type = 'verification') {
  try {
    console.log(`📧 Sending OTP Email to ${email}: ${otpCode} (${type})`);
    
    const subject = type === 'verification' ? 'Email Verification Code' : 'Login Verification Code';
    const htmlContent = generateOTPEmailHTML(otpCode, type);
    
    const mailOptions = {
      from: `"Open Book" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
}

// Send welcome email
export async function sendWelcomeEmail(email, name) {
  try {
    console.log(`📧 Sending Welcome Email to ${name} (${email})`);
    
    const htmlContent = generateWelcomeEmailHTML(name);
    
    const mailOptions = {
      from: `"Open Book" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to Open Book!',
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Welcome email sending error:', error);
    return { success: false, error: error.message };
  }
}
