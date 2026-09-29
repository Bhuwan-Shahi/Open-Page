import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { prisma } from '@/lib/prisma';

export const POST = withAuth(async function(request, { params }) {
  try {
    const { id } = await params;
    const userId = request.user.id;

    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        id: id,
        userId: userId
      },
      include: {
        orderItems: {
          include: {
            book: true
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

    // Orders can only be verified from PENDING status
    if (order.status === 'EXPIRED') {
      return NextResponse.json({
        verified: false,
        status: 'expired',
        message: 'Order has expired. Please create a new order.'
      });
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json({
        verified: false,
        status: order.status.toLowerCase(),
        message: `Order is already ${order.status.toLowerCase()}.`
      });
    }

    // Expire stale orders (payment window has passed)
    if (order.expiresAt && new Date() > new Date(order.expiresAt)) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'EXPIRED' }
      });

      return NextResponse.json({
        verified: false,
        status: 'expired',
        message: 'Order has expired. Please create a new order.'
      });
    }

    // Manual bank-transfer flow: customers cannot self-verify payments.
    // Money moves only after an admin verifies the uploaded payment screenshot,
    // which grants book access (see /api/admin/payment-screenshots PATCH).
    return NextResponse.json({
      verified: false,
      status: 'pending',
      message:
        'Your payment is awaiting manual verification. ' +
        'Please upload your payment screenshot and our team will verify it shortly.'
    }, { status: 200 });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
});
