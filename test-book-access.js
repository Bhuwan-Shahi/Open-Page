const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBookAccessSystem() {
  try {
    console.log('🔍 Testing Book Access System...\n');

    // Get a user and book for testing
    const user = await prisma.user.findFirst({
      where: { role: 'USER' }
    });

    const book = await prisma.book.findFirst();

    if (!user || !book) {
      console.log('❌ No user or book found for testing');
      return;
    }

    console.log(`👤 Testing with user: ${user.email}`);
    console.log(`📚 Testing with book: ${book.title}\n`);

    // Check current access
    const currentAccess = await prisma.userBookAccess.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: book.id
        }
      }
    });

    console.log('📊 Current Access Status:', currentAccess ? 'Has Access' : 'No Access');
    
    if (currentAccess) {
      console.log(`   - Access Type: ${currentAccess.accessType}`);
      console.log(`   - Active: ${currentAccess.isActive}`);
      console.log(`   - Download Count: ${currentAccess.downloadCount}`);
      console.log(`   - Granted At: ${currentAccess.grantedAt}`);
      console.log(`   - Last Accessed: ${currentAccess.lastAccessed || 'Never'}`);
    }

    // Check orders
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        orderItems: {
          include: {
            book: {
              select: { title: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n📦 User Orders: ${orders.length}`);
    orders.forEach((order, index) => {
      console.log(`   ${index + 1}. Order ${order.id.slice(-8)} - Status: ${order.status} - Total: NPR ${order.total}`);
      order.orderItems.forEach(item => {
        console.log(`      - ${item.book.title}`);
      });
    });

    // Check notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log(`\n🔔 Recent Notifications: ${notifications.length}`);
    notifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} - ${notif.read ? 'Read' : 'Unread'}`);
      console.log(`      ${notif.message}`);
    });

    // Check payment screenshots
    const screenshots = await prisma.paymentScreenshot.findMany({
      where: { userId: user.id },
      include: {
        order: {
          select: { id: true, status: true }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    });

    console.log(`\n📸 Payment Screenshots: ${screenshots.length}`);
    screenshots.forEach((screenshot, index) => {
      console.log(`   ${index + 1}. ${screenshot.filename} - Verified: ${screenshot.verified}`);
      console.log(`      Order: ${screenshot.order.id.slice(-8)} (${screenshot.order.status})`);
    });

    console.log('\n✅ Book Access System Test Complete!');

  } catch (error) {
    console.error('❌ Error testing book access system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBookAccessSystem();
