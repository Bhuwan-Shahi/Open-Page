// Test script to create a notification for testing
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestNotification() {
  try {
    // Get the first user
    const users = await prisma.user.findMany({
      where: {
        role: 'USER'
      },
      take: 1
    });
    
    if (users.length === 0) {
      console.log('No users found');
      return;
    }
    
    const user = users[0];
    console.log('Creating test notification for user:', user.email);
    
    // Create a test notification
    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'PAYMENT_VERIFIED',
        title: '🎉 Test Notification - Payment Verified!',
        message: 'This is a test notification to verify the notification system is working correctly.',
        data: {
          testData: true,
          timestamp: new Date()
        }
      }
    });
    
    console.log('Test notification created:', notification);
    
    // Get all notifications for this user
    const allNotifications = await prisma.notification.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`User has ${allNotifications.length} total notifications`);
    
  } catch (error) {
    console.error('Error creating test notification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestNotification();
