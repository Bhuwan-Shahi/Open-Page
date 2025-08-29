import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { isOTPValid } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, otpCode, userId } = await request.json();

    console.log('🔍 OTP Verification attempt:', { email, otpCode: otpCode ? '***' + otpCode.slice(-2) : 'missing', userId });

    // Validation - support both email and userId
    if ((!userId && !email) || !otpCode) {
      return NextResponse.json(
        { error: 'Email or User ID and OTP code are required' },
        { status: 400 }
      );
    }

    if (otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      return NextResponse.json(
        { error: 'Invalid OTP format. Must be 6 digits.' },
        { status: 400 }
      );
    }

    // Find user by email or userId
    const whereClause = userId ? { id: userId } : { email: email };
    const user = await prisma.user.findUnique({
      where: whereClause
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check OTP attempts
    if (user.otpAttempts >= 5) {
      return NextResponse.json(
        { error: 'Too many OTP attempts. Please request a new OTP.' },
        { status: 429 }
      );
    }

    // Check if OTP exists and is valid
    if (!user.otpCode || !user.otpExpiresAt) {
      return NextResponse.json(
        { error: 'No OTP found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    if (!isOTPValid(user.otpExpiresAt)) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (user.otpCode !== otpCode) {
      // Increment attempts
      await prisma.user.update({
        where: { id: user.id },
        data: { otpAttempts: user.otpAttempts + 1 }
      });

      return NextResponse.json(
        { 
          error: 'Invalid OTP code',
          attemptsLeft: 5 - (user.otpAttempts + 1)
        },
        { status: 400 }
      );
    }

    // OTP is valid - update user
    const updateData = {
      otpCode: null,
      otpExpiresAt: null,
      otpAttempts: 0,
      isVerified: true  // Always verify on successful OTP
    };

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    // Send welcome email for new users
    if (!user.isVerified) {
      await sendWelcomeEmail(updatedUser.email, updatedUser.name);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success response
    const response = NextResponse.json({
      message: !user.isVerified 
        ? 'Account verified successfully! Welcome to Open Book Store!'
        : 'Login successful!',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified
      }
    });

    // Set HTTP-only cookie
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
