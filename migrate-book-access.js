const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createMissingBookAccess() {
  try {
    console.log('🔧 Creating missing UserBookAccess records for existing PAID orders...\n');

    // Find all PAID orders that don't have corresponding UserBookAccess records
    const paidOrders = await prisma.order.findMany({
      where: {
        status: 'PAID'
      },
      include: {
        orderItems: {
          include: {
            book: true
          }
        },
        user: true
      }
    });

    console.log(`Found ${paidOrders.length} PAID orders to process`);

    for (const order of paidOrders) {
      console.log(`\nProcessing order ${order.id.slice(-8)} for user ${order.user.email}`);
      
      for (const orderItem of order.orderItems) {
        // Check if UserBookAccess already exists
        const existingAccess = await prisma.userBookAccess.findUnique({
          where: {
            userId_bookId: {
              userId: order.userId,
              bookId: orderItem.bookId
            }
          }
        });

        if (!existingAccess) {
          // Create UserBookAccess record
          const bookAccess = await prisma.userBookAccess.create({
            data: {
              userId: order.userId,
              bookId: orderItem.bookId,
              orderId: order.id,
              accessType: 'PURCHASED',
              grantedAt: order.updatedAt || order.createdAt,
              isActive: true
            }
          });

          console.log(`  ✅ Created access for book: ${orderItem.book.title}`);
        } else {
          console.log(`  ⏭️  Access already exists for book: ${orderItem.book.title}`);
        }
      }
    }

    // Summary
    const totalBookAccess = await prisma.userBookAccess.count();
    console.log(`\n📊 Summary:`);
    console.log(`   - Total UserBookAccess records: ${totalBookAccess}`);
    
    const accessByUser = await prisma.userBookAccess.groupBy({
      by: ['userId'],
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    });

    console.log(`   - Users with active book access: ${accessByUser.length}`);
    
    console.log('\n✅ Migration complete!');

  } catch (error) {
    console.error('❌ Error creating missing book access:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingBookAccess();
