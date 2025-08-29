import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/authMiddleware';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

export const POST = withAuth(async function(request) {
  try {
    const body = await request.json();
    const { bookId, items } = body;
    const userId = request.user.id;

    // Handle single book purchase or cart checkout
    let orderItems = [];
    let totalAmount = 0;

    if (bookId) {
      // Single book purchase
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

      orderItems = [{
        bookId: bookId,
        quantity: 1,
        price: book.price
      }];
      totalAmount = book.price;

    } else if (items && items.length > 0) {
      // Cart checkout with multiple items
      const bookIds = items.map(item => item.bookId);
      const books = await prisma.book.findMany({
        where: { id: { in: bookIds } }
      });

      if (books.length !== items.length) {
        return NextResponse.json(
          { error: 'Some books were not found' },
          { status: 404 }
        );
      }

      // Check for already owned books
      const existingOrders = await prisma.order.findMany({
        where: {
          userId: userId,
          status: 'COMPLETED',
          orderItems: {
            some: {
              bookId: { in: bookIds }
            }
          }
        },
        include: {
          orderItems: true
        }
      });

      const ownedBookIds = existingOrders.flatMap(order => 
        order.orderItems.map(item => item.bookId)
      );

      const alreadyOwnedBooks = books.filter(book => ownedBookIds.includes(book.id));
      if (alreadyOwnedBooks.length > 0) {
        return NextResponse.json(
          { 
            error: `You already own: ${alreadyOwnedBooks.map(b => b.title).join(', ')}` 
          },
          { status: 400 }
        );
      }

      // Prepare order items
      orderItems = items.map(item => {
        const book = books.find(b => b.id === item.bookId);
        return {
          bookId: item.bookId,
          quantity: item.quantity || 1,
          price: book.price
        };
      });

      totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    } else {
      return NextResponse.json(
        { error: 'Either bookId or items array is required' },
        { status: 400 }
      );
    }

    // Create order with expiration (30 minutes from now)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    
    const order = await prisma.order.create({
      data: {
        userId: userId,
        total: totalAmount,
        status: 'PENDING',
        expiresAt: expiresAt,
        orderItems: {
          create: orderItems
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

    // Generate bank transfer QR code with real bank details
    const bankTransferDetails = {
      bankName: "Siddhartha Bank",
      accountNumber: "55501525653",
      accountName: "Bhuban Shahi",
      amount: totalAmount,
      reference: order.id,
      currency: "NPR"
    };

    // Create bank transfer details for QR code
    const bankTransferText = `Bank: ${bankTransferDetails.bankName}
Account: ${bankTransferDetails.accountNumber}
Name: ${bankTransferDetails.accountName}
Amount: NPR ${bankTransferDetails.amount}
Reference: ${bankTransferDetails.reference}
Message: BookStore Order Payment`;

    // Generate QR code with bank transfer details
    const qrCodeDataUrl = await QRCode.toDataURL(bankTransferText, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    // Return the order (QR code generation and payment details are handled in the response)
    const updatedOrder = order;

    return NextResponse.json({
      message: 'Order created successfully',
      order: {
        id: updatedOrder.id,
        total: updatedOrder.total,
        status: updatedOrder.status,
        qrCode: qrCodeDataUrl,
        paymentUrl: bankTransferText,
        expiresAt: updatedOrder.expiresAt,
        orderItems: updatedOrder.orderItems,
        // For backward compatibility with single book purchase
        book: updatedOrder.orderItems[0]?.book
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
