import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

export const GET = withAuth(async function(request) {
  try {
    console.log('📸 Admin payment screenshots API called');
    console.log('User:', request.user);
    
    // Check if user is admin
    if (request.user.role !== 'ADMIN') {
      console.log('❌ Access denied - not admin');
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    console.log('✅ Admin access confirmed');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'pending', 'verified', 'all'

    console.log('📊 Filter status:', status);

    let whereClause = {};
    if (status === 'pending') {
      whereClause.verified = false;
    } else if (status === 'verified') {
      whereClause.verified = true;
      }

      const screenshots = await prisma.paymentScreenshot.findMany({
        where: whereClause,
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true
                }
              },
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
          }
        },
        orderBy: {
          uploadedAt: 'desc'
        }
      });

      console.log('📊 Found screenshots:', screenshots.length);
      console.log('📋 Screenshots data:', screenshots.map(s => ({
        id: s.id,
        orderId: s.orderId,
        verified: s.verified,
        uploadedAt: s.uploadedAt
      })));

      return NextResponse.json({
        screenshots,
        total: screenshots.length
      }, { status: 200 });

    } catch (error) {
      console.error('Error fetching payment screenshots:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
});

export const PATCH = withAuth(async function(request) {
  try {
    // Check if user is admin
    if (request.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { screenshotId, action } = await request.json();

      if (!screenshotId || !action) {
        return NextResponse.json({ error: 'Screenshot ID and action are required' }, { status: 400 });
      }

      const screenshot = await prisma.paymentScreenshot.findUnique({
        where: { id: screenshotId },
        include: {
          order: true
        }
      });

      if (!screenshot) {
        return NextResponse.json({ error: 'Screenshot not found' }, { status: 404 });
      }

      if (action === 'verify') {
        // Verify the screenshot and mark order as paid
        const result = await prisma.$transaction(async (tx) => {
          // Update screenshot verification
          await tx.paymentScreenshot.update({
            where: { id: screenshotId },
            data: {
              verified: true,
              verifiedBy: request.user.id,
              verifiedAt: new Date()
            }
          });

          // Update order status
          await tx.order.update({
            where: { id: screenshot.orderId },
            data: {
              status: 'PAID',
              updatedAt: new Date()
            }
          });

          // Get the order with book details
          const orderDetails = await tx.order.findUnique({
            where: { id: screenshot.orderId },
            include: {
              user: true,
              orderItems: {
                include: {
                  book: true
                }
              }
            }
          });

          // Create UserBookAccess records for each book in the order
          for (const orderItem of orderDetails.orderItems) {
            await tx.userBookAccess.upsert({
              where: {
                userId_bookId: {
                  userId: orderDetails.userId,
                  bookId: orderItem.bookId
                }
              },
              update: {
                isActive: true,
                grantedAt: new Date()
              },
              create: {
                userId: orderDetails.userId,
                bookId: orderItem.bookId,
                orderId: screenshot.orderId,
                accessType: 'PURCHASED',
                grantedAt: new Date(),
                isActive: true
              }
            });
          }

          return orderDetails;
        });

        // Create notification for the user
        const bookTitle = result.orderItems[0]?.book?.title || 'Your book';
        await createNotification(
          result.userId,
          'PAYMENT_VERIFIED',
          '🎉 Payment Verified!',
          `Your payment for "${bookTitle}" has been verified. Your book is now available for download!`,
          {
            orderId: screenshot.orderId,
            bookId: result.orderItems[0]?.book?.id,
            bookTitle: bookTitle
          }
        );

        return NextResponse.json({
          message: 'Payment verified successfully and book access granted'
        }, { status: 200 });

      } else if (action === 'reject') {
        // Mark screenshot as rejected (you might want to add a rejection reason)
        await prisma.paymentScreenshot.update({
          where: { id: screenshotId },
          data: {
            verified: false,
            verifiedBy: request.user.id,
            verifiedAt: new Date()
          }
        });

        // Get the order with book details for notification
        const orderDetails = await prisma.order.findUnique({
          where: { id: screenshot.orderId },
          include: {
            user: true,
            orderItems: {
              include: {
                book: true
              }
            }
          }
        });

        // Create notification for the user
        const bookTitle = orderDetails.orderItems[0]?.book?.title || 'Your book';
        await createNotification(
          orderDetails.userId,
          'PAYMENT_REJECTED',
          '❌ Payment Verification Failed',
          `We couldn't verify your payment for "${bookTitle}". Please contact support or upload a clearer screenshot.`,
          {
            orderId: screenshot.orderId,
            bookId: orderDetails.orderItems[0]?.book?.id,
            bookTitle: bookTitle
          }
        );

        return NextResponse.json({
          message: 'Payment rejected'
        }, { status: 200 });
      }

      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
      console.error('Error updating payment screenshot:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
});
