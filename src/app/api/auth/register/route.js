import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateOTP, sendOTPEmail } from '@/lib/email';
import { isValidEmail, isValidPhone, getOTPExpiration } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { name, email, phone, password } = await request.json();

    // Validation
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Name, email, phone, and password are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { phone: phone }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }
      if (existingUser.phone === phone) {
        return NextResponse.json(
          { error: 'Phone number already registered' },
          { status: 409 }
        );
      }
    }

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpiresAt = getOTPExpiration();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine user role (admin for specific email)
    const role = email === 'shahibhuwan265@gmail.com' ? 'ADMIN' : 'USER';

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        otpCode,
        otpExpiresAt,
        isVerified: false,
        otpAttempts: 0
      }
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otpCode, 'verification');
    
    if (!emailResult.success) {
      // Delete user if email fails
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Registration successful! Please check your email for OTP verification.',
      userId: user.id,
      email: user.email
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
