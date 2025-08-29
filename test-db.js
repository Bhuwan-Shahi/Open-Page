// Quick test script to check PaymentScreenshot table
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const userCount = await prisma.user.count();
    console.log('👥 Users in database:', userCount);
    
    // Check if PaymentScreenshot table exists
    try {
      const screenshotCount = await prisma.paymentScreenshot.count();
      console.log('📸 PaymentScreenshots in database:', screenshotCount);
      
      // Get all screenshots
      const screenshots = await prisma.paymentScreenshot.findMany({
        include: {
          order: {
            select: { id: true, total: true }
          },
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      
      console.log('📋 All screenshots:');
      screenshots.forEach(s => {
        console.log(`- ID: ${s.id}, Order: ${s.orderId}, User: ${s.user.name}, Verified: ${s.verified}`);
      });
      
    } catch (error) {
      console.error('❌ PaymentScreenshot table error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
