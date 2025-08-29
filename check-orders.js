// Check orders and their screenshot status
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkOrders() {
  try {
    console.log('📦 Checking orders...');
    
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        },
        orderItems: {
          include: {
            book: {
              select: { title: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    
    console.log(`📋 Found ${orders.length} orders:`);
    orders.forEach(order => {
      console.log(`- Order ${order.id.slice(-8)}: ${order.user.name}, Status: ${order.status}, Screenshot: ${order.screenshotUploaded}, Total: NPR ${order.total}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrders();
