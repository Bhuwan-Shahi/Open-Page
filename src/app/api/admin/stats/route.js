import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/authMiddleware';

const prisma = new PrismaClient();

export const GET = withAuth(async function(request) {
  try {
    // Check if user is admin
    if (request.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get total books count
    const totalBooks = await prisma.book.count({
      where: { isActive: true }
    });

    // Get total orders count
    const totalOrders = await prisma.order.count();

    // Get total revenue from completed orders
    const revenueResult = await prisma.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { total: true }
    });
    const totalRevenue = revenueResult._sum.total || 0;

    // Get pending orders count
    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING' }
    });

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true }
        },
        orderItems: {
          include: {
            book: {
              select: { title: true }
            }
          }
        }
      }
    });

    return NextResponse.json({
      totalBooks,
      totalOrders,
      totalRevenue,
      pendingOrders,
      recentOrders
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
});
