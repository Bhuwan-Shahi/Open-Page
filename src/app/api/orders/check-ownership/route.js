import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/authMiddleware';

const prisma = new PrismaClient();

export const GET = withAuth(async function(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const userId = request.user.id;

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    // Check if user has a completed order for this book
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: userId,
        status: 'COMPLETED',
        orderItems: {
          some: {
            bookId: bookId
          }
        }
      }
    });

    return NextResponse.json({
      ownsBook: !!existingOrder
    });

  } catch (error) {
    console.error('Error checking ownership:', error);
    return NextResponse.json(
      { error: 'Failed to check ownership' },
      { status: 500 }
    );
  }
});
