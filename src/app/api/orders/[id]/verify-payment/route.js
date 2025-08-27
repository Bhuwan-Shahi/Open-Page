import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/authMiddleware';

const prisma = new PrismaClient();

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

    // Check if order is expired
    if (new Date() > new Date(order.expiresAt)) {
      // Update order status to expired
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'EXPIRED' }
      });

      return NextResponse.json({
        verified: false,
        status: 'expired',
        message: 'Order has expired'
      });
    }

    // In a real implementation, this is where you would:
    // 1. Check with your payment gateway API
    // 2. Verify the payment transaction
    // 3. Match the payment amount with the order total
    // 4. Verify the payment reference/transaction ID
    
    // For demo purposes, we'll simulate payment verification
    // In production, replace this with actual payment gateway verification
    const simulatePaymentCheck = () => {
      // Simulate a 70% success rate for demo
      return Math.random() > 0.3;
    };

    const isPaymentVerified = simulatePaymentCheck();

    if (isPaymentVerified) {
      // Update order status to completed
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { 
          status: 'COMPLETED',
          paidAt: new Date()
        }
      });

      return NextResponse.json({
        verified: true,
        status: 'completed',
        message: 'Payment verified successfully',
        order: updatedOrder
      });
    } else {
      return NextResponse.json({
        verified: false,
        status: 'pending',
        message: 'Payment not found. Please ensure you have completed the payment.'
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
});
