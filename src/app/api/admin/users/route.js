import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // Verify authentication from cookie
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get the current user to verify admin role
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true
      }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get all users with their book access statistics
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            bookAccess: true,
            orders: true,
            notifications: true
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

    const usersWithStats = users.map(user => {
      // Calculate order statistics
      const completedOrders = user.orders.filter(order => order.status === 'COMPLETED');
      const totalSpent = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const lastOrderDate = user.orders.length > 0 ? user.orders[0].createdAt : null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        verified: user.isVerified,
        active: user.isActive,
        createdAt: user.createdAt,
        totalBooks: user._count.bookAccess,
        totalOrders: user._count.orders,
        completedOrders: completedOrders.length,
        totalSpent: totalSpent,
        lastOrderDate: lastOrderDate,
        totalNotifications: user._count.notifications
      };
    });

    return NextResponse.json({
      users: usersWithStats,
      totalUsers: users.length,
      adminUsers: users.filter(user => user.role === 'ADMIN').length,
      verifiedUsers: users.filter(user => user.isVerified).length,
      activeUsers: users.filter(user => user.isActive).length
    });

  } catch (error) {
    console.error('Error in admin users API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
