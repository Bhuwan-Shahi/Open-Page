import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/authMiddleware';

const prisma = new PrismaClient();

export const GET = withAuth(async function(request, { params }) {
  try {
    const { id } = await params;
    const userId = request.user.id;

    const order = await prisma.order.findFirst({
      where: {
        id: id,
        userId: userId
      },
      include: {
        orderItems: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                price: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Format response
    const formattedOrder = {
      id: order.id,
      total: order.total,
      status: order.status,
      qrCode: order.qrCode,
      paymentUrl: order.paymentUrl,
      expiresAt: order.expiresAt,
      createdAt: order.createdAt,
      book: order.orderItems[0]?.book || null
    };

    return NextResponse.json({
      order: formattedOrder
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
});
