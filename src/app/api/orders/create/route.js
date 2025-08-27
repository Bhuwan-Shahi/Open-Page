import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/authMiddleware';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

export const POST = withAuth(async function(request) {
  try {
    const body = await request.json();
    const { bookId } = body;
    const userId = request.user.id;

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    // Get book details
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    });

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Check if user already owns this book
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

    if (existingOrder) {
      return NextResponse.json(
        { error: 'You already own this book' },
        { status: 400 }
      );
    }

    // Create order with expiration (30 minutes from now)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    
    const order = await prisma.order.create({
      data: {
        userId: userId,
        total: book.price,
        status: 'PENDING',
        paymentMethod: 'QR_CODE',
        expiresAt: expiresAt,
        orderItems: {
          create: {
            bookId: bookId,
            quantity: 1,
            price: book.price
          }
        }
      },
      include: {
        orderItems: {
          include: {
            book: true
          }
        }
      }
    });

    // Generate payment URL (in real scenario, this would be from payment gateway)
    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/payment/${order.id}`;
    
    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(paymentUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Update order with QR code and payment URL
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        qrCode: qrCodeDataUrl,
        paymentUrl: paymentUrl
      }
    });

    return NextResponse.json({
      message: 'Order created successfully',
      order: {
        id: updatedOrder.id,
        total: updatedOrder.total,
        status: updatedOrder.status,
        qrCode: updatedOrder.qrCode,
        paymentUrl: updatedOrder.paymentUrl,
        expiresAt: updatedOrder.expiresAt,
        book: {
          id: book.id,
          title: book.title,
          author: book.author,
          price: book.price
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
});
