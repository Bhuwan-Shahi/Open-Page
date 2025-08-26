const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function updateAdminPassword() {
  try {
    console.log('🔧 Updating admin password...');
    
    // Hash the admin password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Update the admin user with password
    const updatedAdmin = await prisma.user.update({
      where: { email: 'shahibhuwan265@gmail.com' },
      data: {
        password: hashedPassword,
        isVerified: true,
        isActive: true
      }
    });
    
    console.log('✅ Admin password updated successfully for:', updatedAdmin.email);
    
  } catch (error) {
    console.error('❌ Error updating admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();
