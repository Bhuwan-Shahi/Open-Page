const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserBookAccess() {
  try {
    console.log('📚 Checking User Book Access Records...\n');

    // Get all users with book access
    const usersWithAccess = await prisma.userBookAccess.findMany({
      include: {
        user: {
          select: { email: true, name: true }
        },
        book: {
          select: { title: true, author: true }
        },
        order: {
          select: { id: true, status: true, total: true }
        }
      },
      orderBy: { grantedAt: 'desc' }
    });

    console.log(`Found ${usersWithAccess.length} book access records:\n`);

    usersWithAccess.forEach((access, index) => {
      console.log(`${index + 1}. ${access.user.email} has access to "${access.book.title}"`);
      console.log(`   - Book: ${access.book.title} by ${access.book.author}`);
      console.log(`   - Access Type: ${access.accessType}`);
      console.log(`   - Active: ${access.isActive ? '✅' : '❌'}`);
      console.log(`   - Downloads: ${access.downloadCount}`);
      console.log(`   - Granted: ${access.grantedAt.toLocaleDateString()}`);
      console.log(`   - Order: ${access.order.id.slice(-8)} (${access.order.status}) - NPR ${access.order.total}`);
      console.log('');
    });

    // Check specific user book access
    const testUser = await prisma.user.findFirst({
      where: { email: 'darkpunk975@gmail.com' }
    });

    if (testUser) {
      const userBooks = await prisma.userBookAccess.findMany({
        where: { userId: testUser.id },
        include: {
          book: {
            select: { id: true, title: true, author: true }
          }
        }
      });

      console.log(`\n👤 Books accessible by ${testUser.email}:`);
      userBooks.forEach((access, index) => {
        console.log(`   ${index + 1}. ${access.book.title} by ${access.book.author}`);
        console.log(`      - Book ID: ${access.book.id}`);
        console.log(`      - Active: ${access.isActive ? '✅' : '❌'}`);
        console.log(`      - Downloads: ${access.downloadCount}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking user book access:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserBookAccess();
