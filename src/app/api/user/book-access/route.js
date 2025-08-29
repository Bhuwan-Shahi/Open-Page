import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { prisma } from '@/lib/prisma';

export const GET = withAuth(async function(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    
    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
    }

    const userId = request.user.id;

    // Check if user has active access to this book
    const bookAccess = await prisma.userBookAccess.findUnique({
      where: {
        userId_bookId: {
          userId: userId,
          bookId: bookId
        }
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            pdfUrl: true
          }
        },
        order: {
          select: {
            id: true,
            status: true,
            total: true
          }
        }
      }
    });

    const hasAccess = bookAccess && 
                     bookAccess.isActive && 
                     (!bookAccess.expiresAt || new Date() <= bookAccess.expiresAt);

    return NextResponse.json({
      hasAccess,
      bookAccess: hasAccess ? bookAccess : null,
      accessDetails: hasAccess ? {
        grantedAt: bookAccess.grantedAt,
        downloadCount: bookAccess.downloadCount,
        lastAccessed: bookAccess.lastAccessed,
        accessType: bookAccess.accessType
      } : null
    }, { status: 200 });

  } catch (error) {
    console.error('Error checking book access:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
