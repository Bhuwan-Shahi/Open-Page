import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/authMiddleware';

export const GET = withAuth(async function(request) {
  try {
    console.log('Admin users API called');
    console.log('User from token:', request.user);
    console.log('User role:', request.user?.role);
    console.log('Is admin?', request.user?.role === 'ADMIN');
    
    // Check if user is admin
    if (request.user.role !== 'ADMIN') {
      console.log('Access denied - not admin. User role:', request.user?.role);
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.log('Admin access confirmed, fetching users...');

    // Get all users with their order statistics
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            orders: true
          }
        },
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate user statistics
    const usersWithStats = users.map(user => {
      const completedOrders = user.orders.filter(order => order.status === 'COMPLETED');
      const totalSpent = completedOrders.reduce((sum, order) => sum + order.total, 0);
      const lastOrderDate = user.orders.length > 0 ? user.orders[0].createdAt : null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.isVerified,
        createdAt: user.createdAt,
        totalOrders: user._count.orders,
        completedOrders: completedOrders.length,
        totalSpent: totalSpent,
        lastOrderDate: lastOrderDate
      };
    });

    return NextResponse.json({
      users: usersWithStats,
      totalUsers: users.length,
      adminUsers: users.filter(user => user.role === 'ADMIN').length,
      verifiedUsers: users.filter(user => user.isVerified).length
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users: ' + error.message },
      { status: 500 }
    );
  }
});
w