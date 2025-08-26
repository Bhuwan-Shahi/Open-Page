import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateOTP, sendOTPEmail } from '@/lib/email';
import { getOTPExpiration } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { userId, type } = await request.json();

    // Validation
    if (!userId || !type) {
      return NextResponse.json(
        { error: 'User ID and type are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const otpExpiresAt = getOTPExpiration();

    // Update user with new OTP
    await prisma.user.update({
      where: { id: userId },
      data: {
        otpCode,
        otpExpiresAt,
        otpAttempts: 0
      }
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(user.email, otpCode, type);
    
    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'OTP sent successfully! Please check your email.',
      email: user.email
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
