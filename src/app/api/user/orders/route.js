import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { prisma } from '@/lib/prisma';

export const GET = withAuth(async function(request) {
  try {
    const userId = request.user.id;
    
    // Get user's book access records instead of orders
    const bookAccess = await prisma.userBookAccess.findMany({
      where: {
        userId: userId,
        isActive: true
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            price: true,
            coverImage: true,
            category: true
          }
        },
        order: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        grantedAt: 'desc'
      }
    });

    // Also get traditional orders for compatibility
    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
        status: {
          in: ['PAID', 'COMPLETED']
        }
      },
      include: {
        orderItems: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                price: true,
                coverImage: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      bookAccess,
      orders,
      total: bookAccess.length
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
